import re

def clean_phone_number(phone_num: str) -> str:
    """
    Cleans up whitespace and brackets from raw input phone numbers.
    """
    cleaned = re.sub(r"[\s\-\(\)]", "", phone_num)
    if not cleaned.startswith("+"):
        # Assume default +91 for Indian phone formats if not specified
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
    return cleaned
