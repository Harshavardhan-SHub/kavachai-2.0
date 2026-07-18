"""
Kavach-AI 2.0 — Threat Taxonomy Module.

Provides a comprehensive mapping from raw backend threat_type strings to
structured threat categories, along with metadata used by the formatter
to generate rich WhatsApp security reports.

The backend is a BLACK BOX — it returns a `threat_type` string (e.g.
"Utility Bill Scam"). This module maps those strings into a canonical
taxonomy so the WhatsApp layer can display consistent category names,
infer target audiences, and select appropriate educational tips.
"""

from typing import Dict, Any


# ---------------------------------------------------------------------------
# Canonical Threat Categories
# ---------------------------------------------------------------------------
# Each backend threat_type is mapped to one of these high-level categories.
# The formatter uses the category key to look up display names, icons, and
# educational tips.
# ---------------------------------------------------------------------------

THREAT_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # ── Financial Scams ────────────────────────────────────────────────
    "utility_bill_scam": {
        "display_name": "Financial Fraud — Utility Bill Scam",
        "icon": "💡",
        "description": "Scammers impersonate utility companies and threaten service disconnection to extort immediate payment.",
        "target_audiences": ["senior_citizens", "homeowners", "rural_users"],
    },
    "lottery_scam": {
        "display_name": "Financial Fraud — Lottery / Prize Scam",
        "icon": "🎰",
        "description": "Fake lottery or prize-winning notifications that demand upfront fees or personal details.",
        "target_audiences": ["senior_citizens", "students", "low_income"],
    },
    "investment_scam": {
        "display_name": "Financial Fraud — Investment Scam",
        "icon": "📈",
        "description": "Promises of unrealistic returns on crypto, stocks, or schemes to steal deposits.",
        "target_audiences": ["young_professionals", "students", "retirees"],
    },
    "loan_scam": {
        "display_name": "Financial Fraud — Loan Scam",
        "icon": "🏦",
        "description": "Fake instant-loan offers requiring upfront processing fees or KYC data.",
        "target_audiences": ["students", "young_professionals", "low_income"],
    },
    "upi_fraud": {
        "display_name": "Financial Fraud — UPI / Payment Scam",
        "icon": "📲",
        "description": "Tricks users into approving UPI collect requests or sharing PINs.",
        "target_audiences": ["senior_citizens", "rural_users", "general"],
    },

    # ── Impersonation / Authority Scams ────────────────────────────────
    "government_impersonation": {
        "display_name": "Impersonation — Government Agency",
        "icon": "🏛️",
        "description": "Scammers pose as tax authorities, police, or government officials to demand payments or data.",
        "target_audiences": ["senior_citizens", "general"],
    },
    "bank_impersonation": {
        "display_name": "Impersonation — Bank / Financial Institution",
        "icon": "🏦",
        "description": "Fake bank calls or messages requesting OTPs, card details, or account credentials.",
        "target_audiences": ["senior_citizens", "general"],
    },
    "tech_support_scam": {
        "display_name": "Impersonation — Tech Support Scam",
        "icon": "🖥️",
        "description": "Fake tech-support agents claim device infection and demand remote access or payment.",
        "target_audiences": ["senior_citizens", "non_tech_savvy"],
    },
    "delivery_scam": {
        "display_name": "Impersonation — Delivery / Courier Scam",
        "icon": "📦",
        "description": "Fake delivery notifications with phishing links or customs-fee demands.",
        "target_audiences": ["online_shoppers", "general"],
    },

    # ── Social Engineering ─────────────────────────────────────────────
    "phishing": {
        "display_name": "Social Engineering — Phishing",
        "icon": "🎣",
        "description": "Deceptive links or pages designed to steal login credentials or personal data.",
        "target_audiences": ["general", "students"],
    },
    "romance_scam": {
        "display_name": "Social Engineering — Romance Scam",
        "icon": "💔",
        "description": "Emotional manipulation through fake romantic interest to extract money.",
        "target_audiences": ["senior_citizens", "lonely_individuals"],
    },
    "job_scam": {
        "display_name": "Social Engineering — Job Scam",
        "icon": "💼",
        "description": "Fake job offers demanding registration fees, training charges, or sensitive documents.",
        "target_audiences": ["students", "young_professionals", "unemployed"],
    },
    "charity_scam": {
        "display_name": "Social Engineering — Charity Scam",
        "icon": "🎗️",
        "description": "Fake charity appeals exploiting disasters or emotional events for donations.",
        "target_audiences": ["senior_citizens", "general"],
    },

    # ── Digital Threats ────────────────────────────────────────────────
    "malware": {
        "display_name": "Digital Threat — Malware / Ransomware",
        "icon": "🦠",
        "description": "Links or attachments that install malicious software on the victim's device.",
        "target_audiences": ["general", "non_tech_savvy"],
    },
    "otp_theft": {
        "display_name": "Digital Threat — OTP / 2FA Theft",
        "icon": "🔑",
        "description": "Attempts to trick the user into sharing one-time passwords or verification codes.",
        "target_audiences": ["senior_citizens", "general"],
    },
    "sim_swap": {
        "display_name": "Digital Threat — SIM Swap Fraud",
        "icon": "📱",
        "description": "Scammers port the victim's phone number to gain access to banking and accounts.",
        "target_audiences": ["general"],
    },

    # ── Miscellaneous ──────────────────────────────────────────────────
    "extortion": {
        "display_name": "Extortion / Sextortion",
        "icon": "⛔",
        "description": "Threats to release embarrassing material unless payment is made.",
        "target_audiences": ["students", "young_professionals"],
    },
    "unknown": {
        "display_name": "Unclassified Threat",
        "icon": "❓",
        "description": "Threat type could not be mapped to a known category.",
        "target_audiences": ["general"],
    },
}


# ---------------------------------------------------------------------------
# Threat-type string → taxonomy key mapping
# ---------------------------------------------------------------------------
# The backend returns free-form threat_type strings. This mapping normalises
# them to canonical taxonomy keys above. The lookup is case-insensitive and
# uses substring matching as a fallback.
# ---------------------------------------------------------------------------

_THREAT_TYPE_ALIASES: Dict[str, str] = {
    # Direct matches (lowercased)
    "utility bill scam": "utility_bill_scam",
    "electricity scam": "utility_bill_scam",
    "gas bill scam": "utility_bill_scam",
    "water bill scam": "utility_bill_scam",
    "lottery scam": "lottery_scam",
    "prize scam": "lottery_scam",
    "lottery/prize scam": "lottery_scam",
    "lucky draw scam": "lottery_scam",
    "investment scam": "investment_scam",
    "crypto scam": "investment_scam",
    "ponzi scheme": "investment_scam",
    "trading scam": "investment_scam",
    "loan scam": "loan_scam",
    "instant loan scam": "loan_scam",
    "loan fraud": "loan_scam",
    "upi fraud": "upi_fraud",
    "upi scam": "upi_fraud",
    "payment scam": "upi_fraud",
    "google pay scam": "upi_fraud",
    "phonepe scam": "upi_fraud",
    "government impersonation": "government_impersonation",
    "police scam": "government_impersonation",
    "tax scam": "government_impersonation",
    "irs scam": "government_impersonation",
    "income tax scam": "government_impersonation",
    "bank impersonation": "bank_impersonation",
    "bank fraud": "bank_impersonation",
    "banking scam": "bank_impersonation",
    "credit card scam": "bank_impersonation",
    "tech support scam": "tech_support_scam",
    "technical support scam": "tech_support_scam",
    "microsoft scam": "tech_support_scam",
    "delivery scam": "delivery_scam",
    "courier scam": "delivery_scam",
    "package scam": "delivery_scam",
    "customs scam": "delivery_scam",
    "phishing": "phishing",
    "phishing scam": "phishing",
    "credential theft": "phishing",
    "romance scam": "romance_scam",
    "dating scam": "romance_scam",
    "love scam": "romance_scam",
    "job scam": "job_scam",
    "employment scam": "job_scam",
    "work from home scam": "job_scam",
    "part time job scam": "job_scam",
    "charity scam": "charity_scam",
    "donation scam": "charity_scam",
    "malware": "malware",
    "ransomware": "malware",
    "virus": "malware",
    "trojan": "malware",
    "otp theft": "otp_theft",
    "otp scam": "otp_theft",
    "otp fraud": "otp_theft",
    "verification code scam": "otp_theft",
    "sim swap": "sim_swap",
    "sim swap fraud": "sim_swap",
    "extortion": "extortion",
    "sextortion": "extortion",
    "blackmail": "extortion",
}


def classify_threat_type(raw_threat_type: str) -> str:
    """
    Map a raw backend ``threat_type`` string to a canonical taxonomy key.

    The lookup proceeds in three stages:
      1. Exact match (case-insensitive) against ``_THREAT_TYPE_ALIASES``.
      2. Substring containment check — if any alias key is *contained in*
         the raw string (or vice-versa), use that mapping.
      3. Fallback to ``"unknown"``.

    Args:
        raw_threat_type: The ``threat_type`` value from the backend response.

    Returns:
        A key present in ``THREAT_TAXONOMY``.
    """
    if not raw_threat_type:
        return "unknown"

    normalised = raw_threat_type.strip().lower()

    # Stage 1: exact match
    if normalised in _THREAT_TYPE_ALIASES:
        return _THREAT_TYPE_ALIASES[normalised]

    # Stage 2: substring containment
    for alias, key in _THREAT_TYPE_ALIASES.items():
        if alias in normalised or normalised in alias:
            return key

    return "unknown"


def get_threat_category(raw_threat_type: str) -> Dict[str, Any]:
    """
    Return the full taxonomy entry for a given raw threat_type string.

    If no match is found, the ``"unknown"`` category is returned.

    Args:
        raw_threat_type: The ``threat_type`` value from the backend response.

    Returns:
        A dictionary with keys ``display_name``, ``icon``, ``description``,
        and ``target_audiences``.
    """
    key = classify_threat_type(raw_threat_type)
    return THREAT_TAXONOMY.get(key, THREAT_TAXONOMY["unknown"])
