import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict

def process_threat_statistics(threats: List[Dict]) -> Dict:
    """
    Process threat data for statistical analysis
    """
    if not threats:
        return {
            "total": 0,
            "by_severity": {},
            "by_type": {},
            "by_date": []
        }
    
    df = pd.DataFrame(threats)
    
    # Count by severity
    severity_counts = df['severity'].value_counts().to_dict()
    
    # Count by type
    type_counts = df['threat_type'].value_counts().to_dict()
    
    # Time series data
    df['date'] = pd.to_datetime(df['timestamp']).dt.date
    date_counts = df.groupby('date').size().reset_index(name='count')
    date_data = [
        {"date": str(row['date']), "count": int(row['count'])}
        for _, row in date_counts.iterrows()
    ]
    
    return {
        "total": len(threats),
        "by_severity": severity_counts,
        "by_type": type_counts,
        "by_date": date_data
    }

def calculate_threat_trends(threats: List[Dict], days: int = 30) -> Dict:
    """
    Calculate threat trends over time
    """
    df = pd.DataFrame(threats)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Filter last N days
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    df = df[df['timestamp'] >= cutoff_date]
    
    # Calculate daily trends
    df['date'] = df['timestamp'].dt.date
    daily_counts = df.groupby('date').size()
    
    # Calculate moving average
    if len(daily_counts) > 7:
        moving_avg = daily_counts.rolling(window=7, min_periods=1).mean()
    else:
        moving_avg = daily_counts
    
    # Calculate trend direction
    if len(daily_counts) >= 2:
        recent_avg = daily_counts.tail(7).mean()
        previous_avg = daily_counts.head(7).mean()
        trend = "increasing" if recent_avg > previous_avg else "decreasing"
    else:
        trend = "stable"
    
    return {
        "trend": trend,
        "daily_average": float(daily_counts.mean()) if len(daily_counts) > 0 else 0,
        "moving_average": moving_avg.tolist()
    }

def aggregate_by_location(threats: List[Dict]) -> List[Dict]:
    """
    Aggregate threats by geographic location
    """
    location_data = []
    
    for threat in threats:
        if threat.get('country'):
            location_data.append({
                'country': threat['country'],
                'severity': threat['severity'],
                'type': threat['threat_type']
            })
    
    if not location_data:
        return []
    
    df = pd.DataFrame(location_data)
    
    # Count by country
    country_counts = df.groupby('country').size().reset_index(name='count')
    
    # Get severity distribution per country
    result = []
    for _, row in country_counts.iterrows():
        country = row['country']
        country_threats = df[df['country'] == country]
        
        result.append({
            'country': country,
            'count': int(row['count']),
            'severity_breakdown': country_threats['severity'].value_counts().to_dict(),
            'type_breakdown': country_threats['type'].value_counts().to_dict()
        })
    
    return sorted(result, key=lambda x: x['count'], reverse=True)

def detect_anomalies(threats: List[Dict], threshold: float = 2.0) -> List[Dict]:
    """
    Detect anomalous threat patterns using statistical methods
    """
    df = pd.DataFrame(threats)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['date'] = df['timestamp'].dt.date
    
    # Daily threat counts
    daily_counts = df.groupby('date').size()
    
    # Calculate mean and std
    mean_count = daily_counts.mean()
    std_count = daily_counts.std()
    
    # Detect anomalies (Z-score method)
    anomalies = []
    for date, count in daily_counts.items():
        z_score = (count - mean_count) / std_count if std_count > 0 else 0
        
        if abs(z_score) > threshold:
            anomalies.append({
                'date': str(date),
                'count': int(count),
                'z_score': float(z_score),
                'type': 'spike' if z_score > 0 else 'drop'
            })
    
    return anomalies

def generate_threat_report(threats: List[Dict]) -> Dict:
    """
    Generate comprehensive threat intelligence report
    """
    stats = process_threat_statistics(threats)
    trends = calculate_threat_trends(threats)
    locations = aggregate_by_location(threats)
    anomalies = detect_anomalies(threats)
    
    return {
        "summary": {
            "total_threats": stats['total'],
            "trend": trends['trend'],
            "daily_average": trends['daily_average']
        },
        "severity_distribution": stats['by_severity'],
        "type_distribution": stats['by_type'],
        "geographic_distribution": locations[:10],
        "anomalies": anomalies,
        "generated_at": datetime.utcnow().isoformat()
    }