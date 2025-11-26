import os
import PyPDF2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = os.path.join(BASE_DIR, "fisher-getting-to-yes.pdf")
TEXT_OUT = os.path.join(BASE_DIR, "textbook.txt")

reader = PyPDF2.PdfReader(PDF_PATH)

text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open(TEXT_OUT, "w") as f:
    f.write(text)

print("Saved:", TEXT_OUT)
