"""
Kavach-AI 2.0 — Educational Tips Module.

Provides contextual safety tips that are appended to threat analysis
reports. Tips are mapped to threat taxonomy categories so each report
contains advice specifically relevant to the detected scam type.

The module also supplies generic daily safety tips for proactive user
education (e.g. in welcome messages or periodic reminders).
"""

import random
from typing import Optional


# ---------------------------------------------------------------------------
# Category-specific educational tips
# ---------------------------------------------------------------------------
# Keys match the canonical taxonomy keys in threat_taxonomy.py.
# Each key maps to a list of tips; the formatter picks one at random to
# keep reports varied across repeated scans.
# ---------------------------------------------------------------------------

EDUCATIONAL_TIPS = {
    "utility_bill_scam": [
        "Utility companies never threaten immediate disconnection via SMS or WhatsApp. Always call the official customer care number printed on your bill.",
        "Scammers create urgency by saying your electricity or gas will be cut within hours. Real disconnection notices arrive weeks in advance by registered post.",
        "Never click payment links in messages claiming to be from your utility provider. Log in to the official website or app instead.",
    ],
    "lottery_scam": [
        "You cannot win a lottery you never entered. Any message claiming you've won a prize is almost certainly a scam.",
        "Legitimate lotteries never ask winners to pay taxes or processing fees upfront. The organiser deducts them from your winnings.",
        "If you receive a 'You've won!' message, search for the organisation online. Scammers use names similar to real brands.",
    ],
    "investment_scam": [
        "Any investment promising guaranteed high returns with zero risk is a scam. All legitimate investments carry risk disclosures.",
        "Verify investment advisors with SEBI (India) or your country's financial regulator before transferring money.",
        "Scammers often show fake profit screenshots or WhatsApp groups with fake testimonials. Never trust unverified claims.",
    ],
    "loan_scam": [
        "Legitimate banks and NBFCs never ask for upfront processing fees via UPI or wallet transfers before disbursing a loan.",
        "Always check the lender's RBI registration before sharing documents. Verify at rbi.org.in.",
        "If a loan app asks for access to your contacts, photos, or gallery, it is likely a predatory lending scam.",
    ],
    "upi_fraud": [
        "You NEVER need to enter your UPI PIN or approve a collect request to *receive* money. If someone asks you to, it's a scam.",
        "Always verify the payee name and UPI ID before confirming any transaction. Scammers use IDs that look like official ones.",
        "Report suspicious UPI transactions immediately through your banking app and at cybercrime.gov.in.",
    ],
    "government_impersonation": [
        "Government agencies do not demand immediate payment via phone, SMS, or WhatsApp. Official notices come by post or email.",
        "If someone claims to be from the police or tax department, hang up and call the official helpline to verify.",
        "The Indian Income Tax Department will never threaten arrest over the phone. Report such calls to 1930.",
    ],
    "bank_impersonation": [
        "Your bank will NEVER ask for your full card number, CVV, OTP, or internet banking password over phone or message.",
        "If you receive a call from your 'bank', hang up and call the number on the back of your debit/credit card.",
        "Enable transaction alerts on your bank account so you are notified of every debit in real-time.",
    ],
    "tech_support_scam": [
        "Microsoft, Google, and Apple will never call you about viruses on your computer. These are always scams.",
        "Never give remote desktop access (AnyDesk, TeamViewer) to someone who contacts you claiming to fix your device.",
        "If a pop-up says 'Your computer is infected — call this number', close the browser immediately. It is fake.",
    ],
    "delivery_scam": [
        "Legitimate courier companies do not ask for payment via links in SMS. Track parcels only on the official courier website.",
        "If you receive a customs-fee demand for a package you didn't order, it is a scam. Do not click the link.",
        "Always verify delivery notifications by entering the tracking number on the official courier site.",
    ],
    "phishing": [
        "Check the URL carefully before entering credentials. Phishing sites use misspelt domains (e.g. 'amaz0n.com').",
        "Enable two-factor authentication on all important accounts. Even if your password is stolen, 2FA blocks access.",
        "Never enter passwords or OTPs on pages you reached via a link in a message. Always type the URL yourself.",
    ],
    "romance_scam": [
        "If someone you've never met in person asks for money — no matter how emotionally compelling the story — it is a scam.",
        "Romance scammers build trust over weeks or months before asking for financial help. Be cautious with online relationships.",
        "Reverse-image-search profile photos of online contacts. Scammers often steal photos from other people's social media.",
    ],
    "job_scam": [
        "Genuine employers never charge candidates for job offers, training, or equipment. If asked to pay, it's a scam.",
        "Verify job offers directly on the company's official careers page or LinkedIn profile before sharing any personal data.",
        "Work-from-home 'typing jobs' or 'data entry jobs' that promise ₹50,000+/month for minimal effort are always fraudulent.",
    ],
    "charity_scam": [
        "Before donating, verify the charity on the government's NGO registration portal (ngodarpan.gov.in for India).",
        "Scammers create urgency around disasters to collect fake donations. Donate only through verified platforms.",
        "If a charity refuses to provide registration details or receipts, do not donate.",
    ],
    "malware": [
        "Never download APK files or apps from links in messages. Only install apps from Google Play Store or Apple App Store.",
        "Keep your phone's operating system and apps updated. Security patches fix vulnerabilities that malware exploits.",
        "If your phone suddenly becomes slow or shows unexpected pop-ups, run a scan with your device's built-in security tool.",
    ],
    "otp_theft": [
        "An OTP is like a key to your accounts. NEVER share it with anyone — not even someone claiming to be from your bank.",
        "If you receive an OTP you did not request, someone may be trying to access your account. Change your password immediately.",
        "Legitimate services will never call you to ask for an OTP. If someone does, hang up immediately.",
    ],
    "sim_swap": [
        "If your phone suddenly loses network signal for an extended period, contact your telecom provider immediately — it may be a SIM swap attack.",
        "Register for SIM swap protection with your telecom operator. This adds an extra verification step before any SIM change.",
        "Link your bank accounts to an email for alerts, so even if your SIM is swapped, you still receive notifications.",
    ],
    "extortion": [
        "Do not respond to blackmail or sextortion messages. Report them immediately to cybercrime.gov.in or call 1930.",
        "Scammers often use recycled or fabricated material. Paying them never guarantees they will stop — it usually escalates.",
        "Block the sender and preserve all evidence (screenshots, phone numbers) for the police report.",
    ],
    "unknown": [
        "When in doubt, do not click, do not pay, and do not share personal information. Verify independently first.",
        "If a message creates urgency or fear, pause and think. Scammers rely on emotional reactions to bypass rational judgment.",
        "Save the national cybercrime helpline number: 1930 (India). Report suspicious messages immediately.",
    ],
}


# ---------------------------------------------------------------------------
# Generic safety tips (not tied to a specific threat category)
# ---------------------------------------------------------------------------

GENERIC_SAFETY_TIPS = [
    "Never share OTPs, PINs, or passwords with anyone — even family members on a call you didn't initiate.",
    "Enable two-factor authentication on all banking and social media accounts.",
    "If an offer sounds too good to be true, it almost certainly is.",
    "Verify unknown callers by calling back on an official number you find independently.",
    "Regularly review your bank statements for unauthorised transactions.",
    "Teach elderly family members about common phone and WhatsApp scams.",
    "Save India's Cyber Crime Helpline: 1930 — report scams immediately.",
    "Keep your apps and phone OS updated to patch known security vulnerabilities.",
    "Do not install apps from links shared on WhatsApp or SMS. Use official app stores only.",
    "Use strong, unique passwords for every account. Consider a password manager.",
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_educational_tip(taxonomy_key: str) -> str:
    """
    Return a single educational tip relevant to the given threat category.

    A random tip is selected from the category-specific list. If the key
    is not recognised, a tip from the ``"unknown"`` category is returned.

    Args:
        taxonomy_key: A canonical key from ``THREAT_TAXONOMY``
                      (e.g. ``"utility_bill_scam"``).

    Returns:
        A single educational tip string.
    """
    tips = EDUCATIONAL_TIPS.get(taxonomy_key, EDUCATIONAL_TIPS["unknown"])
    return random.choice(tips)


def get_random_safety_tip() -> str:
    """
    Return a random generic safety tip for proactive user education.

    Useful for welcome messages, daily reminders, or when no specific
    threat category context is available.

    Returns:
        A single generic safety tip string.
    """
    return random.choice(GENERIC_SAFETY_TIPS)
