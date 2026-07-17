import asyncio
import os
import sys

# Add the backend folder to path so imports work
sys.path.append(os.path.dirname(__file__))

from app.services.sarvam_service import translate_text
from app.services.gemini_service import analyze_text_threat
from app.services.scoring_service import classify_threat

async def test_cases():
    print("==================================================")
    print(" KAVACH-AI BACKEND ENGINE VERIFICATION")
    print("==================================================\n")

    # Case 1: SAFE
    input_1 = "Hi son I reached home."
    print(f"--- Case 1 Input: '{input_1}' ---")
    trans_1 = await translate_text(input_1)
    analysis_1 = await analyze_text_threat(trans_1["translated_text"])
    print(f"Normalized Text: {trans_1['translated_text']}")
    print(f"Threat Score:    {analysis_1['threat_score']}")
    print(f"Risk Level:      {analysis_1['risk_level']} (Expected: SAFE)")
    print(f"Threat Type:     {analysis_1['threat_type']}")
    print(f"Reason Flags:    {analysis_1['reason_flags']}")
    print(f"Action:          {analysis_1['recommended_action']}")
    assert analysis_1['risk_level'] == "SAFE", "Case 1 failed!"
    print("[OK] Case 1 Passed!\n")

    # Case 2: SUSPICIOUS
    input_2 = "Please verify your SBI account urgently."
    print(f"--- Case 2 Input: '{input_2}' ---")
    trans_2 = await translate_text(input_2)
    analysis_2 = await analyze_text_threat(trans_2["translated_text"])
    print(f"Normalized Text: {trans_2['translated_text']}")
    print(f"Threat Score:    {analysis_2['threat_score']}")
    print(f"Risk Level:      {analysis_2['risk_level']} (Expected: SUSPICIOUS)")
    print(f"Threat Type:     {analysis_2['threat_type']}")
    print(f"Reason Flags:    {analysis_2['reason_flags']}")
    print(f"Action:          {analysis_2['recommended_action']}")
    assert analysis_2['risk_level'] in ["SUSPICIOUS", "HIGH"], "Case 2 failed!"
    print("[OK] Case 2 Passed!\n")

    # Case 3: HIGH THREAT
    input_3 = "Your electricity connection will be disconnected. Transfer 2000 rupees immediately."
    print(f"--- Case 3 Input: '{input_3}' ---")
    trans_3 = await translate_text(input_3)
    analysis_3 = await analyze_text_threat(trans_3["translated_text"])
    print(f"Normalized Text: {trans_3['translated_text']}")
    print(f"Threat Score:    {analysis_3['threat_score']}")
    print(f"Risk Level:      {analysis_3['risk_level']} (Expected: HIGH)")
    print(f"Threat Type:     {analysis_3['threat_type']}")
    print(f"Reason Flags:    {analysis_3['reason_flags']}")
    print(f"Action:          {analysis_3['recommended_action']}")
    assert analysis_3['risk_level'] == "HIGH", "Case 3 failed!"
    print("[OK] Case 3 Passed!\n")
    
    print("==================================================")
    print(" ALL TEST CASES PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_cases())
