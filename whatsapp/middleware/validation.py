from fastapi import Request, HTTPException, status

async def validate_webhook_payload(request: Request):
    """
    Validates that the webhook matches the expected WhatsApp Business API payload.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON body payload."
        )

    # Basic validations for Meta payload layout
    if not isinstance(body, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload must be a JSON object."
        )

    # Verify if it's a WhatsApp webhook (usually starts with "object": "whatsapp_business_account" or "whatsapp")
    if "object" not in body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'object' property in payload."
        )
        
    return body
