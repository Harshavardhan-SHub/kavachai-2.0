def classify_threat(threat_score: int) -> str:
    """
    Classify a score into standard risk levels:
    0-35 -> SAFE
    36-70 -> SUSPICIOUS
    71-100 -> HIGH
    """
    if threat_score <= 35:
        return "SAFE"
    elif threat_score <= 70:
        return "SUSPICIOUS"
    else:
        return "HIGH"
