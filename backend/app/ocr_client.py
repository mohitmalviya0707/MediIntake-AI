"""
MediIntake AI OCR Client

Uses pytesseract when available.

Supported:
- PDF
- JPG
- JPEG
- PNG
- WEBP

If Tesseract is unavailable, the system returns a clear
error instead of silently inventing document content.
"""

import io
import os

from PIL import Image


# =========================================================
# TESSERACT IMPORT
# =========================================================

try:
    import pytesseract

    TESSERACT_AVAILABLE = True

except ImportError:
    pytesseract = None
    TESSERACT_AVAILABLE = False


# =========================================================
# PDF SUPPORT
# =========================================================

try:
    from pypdf import PdfReader

    PDF_AVAILABLE = True

except ImportError:
    PdfReader = None
    PDF_AVAILABLE = False


# =========================================================
# LANGUAGE CONFIG
# =========================================================

OCR_LANGUAGE_MAP = {
    "en": "eng",
    "hi": "hin",
    "mr": "mar",
    "bn": "ben",
    "gu": "guj",
    "ta": "tam",
    "te": "tel",
    "kn": "kan",
    "ml": "mal",
    "pa": "pan",
    "or": "ori",
    "as": "asm",
}


# =========================================================
# IMAGE OCR
# =========================================================

def _ocr_image(
    image: Image.Image,
    language: str = "en"
) -> str:

    if not TESSERACT_AVAILABLE:
        raise RuntimeError(
            "pytesseract is not installed. "
            "Run: pip install pytesseract"
        )

    tesseract_language = (
        OCR_LANGUAGE_MAP.get(
            language,
            "eng"
        )
    )

    try:
        return pytesseract.image_to_string(
            image,
            lang=tesseract_language
        )

    except Exception as error:

        # Fallback to English OCR
        try:
            return pytesseract.image_to_string(
                image,
                lang="eng"
            )

        except Exception:
            raise RuntimeError(
                f"Tesseract OCR failed: {error}"
            )


# =========================================================
# PDF OCR
# =========================================================

def _ocr_pdf(
    content: bytes,
    language: str = "en"
) -> str:

    if not PDF_AVAILABLE:
        raise RuntimeError(
            "pypdf is not installed. "
            "Run: pip install pypdf"
        )

    try:

        reader = PdfReader(
            io.BytesIO(content)
        )

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages)

    except Exception as error:

        raise RuntimeError(
            f"PDF extraction failed: {error}"
        )


# =========================================================
# PUBLIC OCR FUNCTION
# =========================================================

def run_ocr(
    file,
    language: str = "en"
) -> str:

    """
    Run OCR/text extraction on uploaded file.

    file can be:
    - FastAPI UploadFile
    - file-like object
    """

    filename = getattr(
        file,
        "filename",
        ""
    ) or ""

    filename_lower = filename.lower()

    # -----------------------------------------------------
    # READ CONTENT
    # -----------------------------------------------------

    if hasattr(file, "file"):

        file.file.seek(0)

        content = file.file.read()

    elif hasattr(file, "read"):

        content = file.read()

    else:

        raise ValueError(
            "Invalid uploaded file."
        )

    if not content:
        raise ValueError(
            "Uploaded file is empty."
        )

    # -----------------------------------------------------
    # PDF
    # -----------------------------------------------------

    if (
        filename_lower.endswith(".pdf")
        or b"%PDF" in content[:10]
    ):

        return _ocr_pdf(
            content,
            language
        )

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    try:

        image = Image.open(
            io.BytesIO(content)
        )

        image.load()

    except Exception as error:

        raise ValueError(
            f"Could not open uploaded image: {error}"
        )

    return _ocr_image(
        image,
        language
    )