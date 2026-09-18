from pathlib import Path
import re

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


PAGE_W, PAGE_H = A4
OUT = Path(r"C:\CRM Platform\output\pdf\Sipu_Rana_NIQ_Associate_Software_Engineer_Resume.pdf")

FONT_DIR = Path(r"C:\Windows\Fonts")
pdfmetrics.registerFont(TTFont("Calibri", str(FONT_DIR / "calibri.ttf")))
pdfmetrics.registerFont(TTFont("Calibri-Bold", str(FONT_DIR / "calibrib.ttf")))
pdfmetrics.registerFont(TTFont("Calibri-Italic", str(FONT_DIR / "calibrii.ttf")))

NAVY = HexColor("#202C3D")
BODY = HexColor("#4D5A6D")
LIGHT_BLUE = HexColor("#C7D3E1")
RULE = HexColor("#252F3E")

LEFT = 32
RIGHT = PAGE_W - 32
TEXT_W = RIGHT - LEFT


def draw_wrapped_segments(c, y, segments, size=10.2, leading=12.6, indent=0):
    """Draw inline-style text, wrapping at word boundaries; return next baseline."""
    x = LEFT + indent
    line_start = x
    line_runs = []

    def flush_line():
        draw_x = line_start
        for run_font, run_text, run_color in line_runs:
            c.setFillColor(run_color)
            c.setFont(run_font, size)
            c.drawString(draw_x, y, run_text)
            draw_x += pdfmetrics.stringWidth(run_text, run_font, size)

    for font, text, color in segments:
        for word in re.findall(r"\S+", text):
            prefix = "" if x == line_start else " "
            token = prefix + word
            token_w = pdfmetrics.stringWidth(token, font, size)
            if x != line_start and x + token_w > RIGHT:
                flush_line()
                y -= leading
                x = line_start
                line_runs = []
                token = word
                token_w = pdfmetrics.stringWidth(token, font, size)
            if line_runs and line_runs[-1][0] == font and line_runs[-1][2] == color:
                old_font, old_text, old_color = line_runs[-1]
                line_runs[-1] = (old_font, old_text + token, old_color)
            else:
                line_runs.append((font, token, color))
            x += token_w
    if line_runs:
        flush_line()
    return y - leading


def draw_body(c, y, text, size=10.2, leading=12.6):
    return draw_wrapped_segments(c, y, [("Calibri", text, BODY)], size, leading)


def draw_bullet(c, y, text, size=10.1, leading=12.35):
    c.setFillColor(HexColor("#000000"))
    c.setFont("Calibri-Bold", 11.5)
    c.drawString(51.2, y, "•")
    return draw_wrapped_segments(c, y, [("Calibri", text, BODY)], size, leading, indent=35.5)


def draw_section(c, y, title):
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.9)
    c.drawString(LEFT, y, title.upper())
    c.setStrokeColor(RULE)
    c.setLineWidth(0.55)
    c.line(LEFT - 1.5, y - 5.3, RIGHT, y - 5.3)
    return y - 19.2


def draw_project_title(c, y, title):
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.55)
    c.drawString(LEFT, y, title)
    return y - 13.6


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("Sipu Rana - Associate Software Engineer Resume")
    c.setAuthor("Sipu Rana")

    # Header
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 17.3)
    c.drawCentredString(PAGE_W / 2, 777.0, "SIPU RANA")
    c.setFillColor(BODY)
    c.setFont("Calibri", 10.0)
    contact = "+91 9827505917  |  sipurana38@gmail.com  |  https://www.github.com/sipu-git  |  https://www.linkedin.com/in/sipu-rana-72b56b242"
    c.drawCentredString(PAGE_W / 2, 758.7, contact)
    c.setStrokeColor(LIGHT_BLUE)
    c.setLineWidth(0.6)
    c.line(LEFT - 1.6, 738.6, RIGHT, 738.6)

    # Career summary
    y = draw_section(c, 722.5, "Career Summary")
    y = draw_body(
        c,
        y,
        "Associate software engineer with 1+ year of experience building, debugging, and optimizing responsive, component-based web applications across the full stack (JavaScript/TypeScript, React.js, Next.js, Node.js, Express.js). Familiar with Angular fundamentals and modern web development practices. Skilled in REST API integration, state handling, Git/GitHub workflows, GitHub Actions CI/CD, code reviews, and Agile/Scrum collaboration; focused on clean, maintainable, secure, high-performance software.",
        size=10.15,
        leading=12.65,
    )

    # Technical skills
    y = draw_section(c, y - 0.5, "Technical Skills")
    skills = [
        ("Version Control & Collaboration:", " Git, GitHub (branching, pull requests, code review, merge conflict resolution), GitHub Actions, CI/CD pipelines, Agile/Scrum"),
        ("Testing & Code Quality:", " Jest, Karma/Jasmine (familiarity), Postman API validation, error handling, cross-layer debugging (frontend, backend, database)"),
        ("Languages & Frontend:", " Angular (component-based architecture), JavaScript (ES6+), TypeScript, HTML5, CSS3, SCSS, React.js, Next.js (SSR/SSG, App Router), TanStack Query (React Query), Redux Toolkit"),
        ("Backend & APIs:", " Node.js, Express.js, RESTful API design & integration, JWT/OAuth, middleware"),
        ("Databases:", " MongoDB & Mongoose, PostgreSQL, MySQL, Prisma ORM, schema design, Redis"),
        ("Cloud & DevOps:", " AWS (EC2, S3, RDS, IAM, CloudWatch), Docker, CI/CD"),
    ]
    for label, value in skills:
        y = draw_wrapped_segments(c, y, [("Calibri-Bold", label, NAVY), ("Calibri", value, BODY)], size=9.82, leading=12.45)

    # Experience
    y = draw_section(c, y - 1.4, "Professional Experience")
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.8)
    c.drawString(LEFT, y, "Software Developer  —  Sparkradix Technologies Pvt. Ltd")
    c.setFillColor(BODY)
    c.setFont("Calibri", 10.45)
    c.drawRightString(RIGHT, y, "2025 – Present")
    y -= 16.5
    y = draw_body(c, y, "Contribute to production React.js/Next.js applications and backend services; collaborate in Agile/Scrum teams, open and review pull requests, and resolve merge conflicts to keep releases reliable.", size=10.05, leading=12.45)
    experience_bullets = [
        "Debug and optimize frontend, backend, and database code; validate REST APIs with Postman and resolve defects before release.",
        "Design and implement RESTful APIs with Express.js, integrating relational (MySQL, PostgreSQL via Prisma) and NoSQL (MongoDB) data layers.",
        "Build reusable, responsive, cross-browser UI components and dynamic templates using semantic HTML5, CSS3/SCSS, JavaScript, and TypeScript.",
        "Collaborate with cross-functional teams to translate requirements into shippable features and incorporate code-review feedback to improve maintainability, security, and performance.",
    ]
    for item in experience_bullets:
        y = draw_bullet(c, y, item)

    # Projects
    y = draw_section(c, y - 1.7, "Projects")
    y = draw_project_title(c, y, "Intelligent Customer Relationship & Workflow Management System")
    y = draw_bullet(c, y, "Built an AI-powered CRM and business automation platform with React.js, TypeScript, Node.js, Express.js, Prisma, PostgreSQL/AWS RDS, Redis, Tailwind CSS, and role-based access control for lead tracking and sales workflows.")
    y = draw_bullet(c, y, "Integrated TanStack Query (React Query) for backend REST API fetching, caching, mutations, invalidation, and loading/error state handling; used Redux Toolkit for client-side UI state and integrated WhatsApp Business API plus Gmail/Zoho Mail.")
    y -= 1.1
    y = draw_project_title(c, y, "Expense Tracking Web Application  &  Role-Based Access HRMS Web Application")
    y = draw_bullet(c, y, "Built an expense platform with React.js, Redux Toolkit, Express.js, PostgreSQL, AI-powered auto-categorization, and Redis-based OTP authentication.")
    y = draw_bullet(c, y, "Built a scalable HRMS platform with RBAC for employee, attendance, leave, and payroll management, optimized with Redis caching and Docker.")

    # Education
    y = draw_section(c, y - 1.8, "Education")
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.55)
    c.drawString(LEFT, y, "Master in Computer Application")
    c.setFillColor(BODY)
    c.setFont("Calibri", 10.45)
    c.drawString(174, y, "—  Gandhi Engineering College")
    y -= 13.3
    c.setFont("Calibri-Italic", 9.9)
    c.drawString(LEFT, y, "CGPA: 8.38  |  2023 – 2025")
    y -= 14.4
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.55)
    c.drawString(LEFT, y, "Bachelor in Computer Application")
    c.setFillColor(BODY)
    c.setFont("Calibri", 10.45)
    c.drawString(181, y, "—  BCCM College, Berhampur University")
    y -= 13.3
    c.setFont("Calibri-Italic", 9.9)
    c.drawString(LEFT, y, "Score: 79%  |  2020 – 2023")

    # Courses and certifications
    y = draw_section(c, y - 17.9, "Courses & Certifications")
    c.setFillColor(NAVY)
    c.setFont("Calibri-Bold", 10.35)
    c.drawString(LEFT, y, "Full Stack Software Development (MERN Stack)")
    c.setFillColor(BODY)
    c.setFont("Calibri", 10.2)
    c.drawString(246, y, "—  Tetratrion Technologies Pvt. Ltd. (Sept 2024 – Apr 2025)")
    y -= 13.4
    c.setFont("Calibri-Italic", 9.65)
    c.drawString(LEFT, y, "Full Stack Development · RESTful API & Backend Architecture · System & Database Design · Frontend Testing & Collaboration")

    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
