import asyncio
import os
import sys

sys.path.append(os.path.dirname(__file__))

from app.services.guardian_service import send_guardian_notification
from app.config import TWILIO_ACCOUNT_SID, TWILIO_PHONE_NUMBER, USE_MOCK_TWILIO

async def test_twilio():
    print("==================================================")
    print(" KAVACH-AI TWILIO ALERT VERIFICATION")
    print("==================================================")
    print(f"Twilio Account SID: {TWILIO_ACCOUNT_SID}")
    print(f"From Number:        {TWILIO_PHONE_NUMBER}")
    print(f"Simulation Mode:    {USE_MOCK_TWILIO}")
    print("--------------------------------------------------")
    
    # We will attempt a notification to a test number.
    # Note: Twilio trial accounts require verified caller IDs,
    # so we will see how the API responds.
    test_number = "+919876543210" # Default sample
    print(f"Sending test notification to {test_number}...")
    
    result = await send_guardian_notification(
        phone_number=test_number,
        threat_type="Test Verification Scam",
        threat_score=85
    )
    
    print("\nResult:")
    print(f"Status:   {result['status']}")
    print(f"Message:  {result['message']}")
    print(f"Sent:     {result['sent']}")
    print(f"Provider: {result.get('provider')}")
    if 'twilio_sid' in result:
        print(f"SMS SID:  {result['twilio_sid']}")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_twilio())
