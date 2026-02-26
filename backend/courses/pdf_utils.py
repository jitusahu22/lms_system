import io
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

def generate_certificate_pdf(student_name, course_title, date_str, cert_id):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Background
    c.setFillColor(HexColor('#f8fafc'))
    c.rect(0, 0, width, height, fill=True, stroke=False)
    
    # Border
    c.setStrokeColor(HexColor('#4f46e5'))
    c.setLineWidth(10)
    c.rect(20, 20, width-40, height-40)

    # Title
    c.setFillColor(HexColor('#0f172a'))
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(width/2, height - 120, "Certificate of Completion")

    # Body
    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2, height - 200, "This certifies that")
    
    c.setFillColor(HexColor('#4f46e5'))
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height - 250, student_name)
    
    c.setFillColor(HexColor('#0f172a'))
    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2, height - 310, "has successfully completed the course:")
    
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width/2, height - 360, course_title)

    # Footer elements
    c.setFont("Helvetica", 14)
    c.drawCentredString(150, 100, f"Date: {date_str}")
    c.line(80, 120, 220, 120)
    
    c.drawCentredString(width - 150, 100, "Instructor Signature")
    c.line(width - 220, 120, width - 80, 120)

    # Validate ID
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor('#64748b'))
    c.drawRightString(width - 30, 30, f"Certificate ID: {cert_id}")

    c.save()
    buffer.seek(0)
    return buffer
