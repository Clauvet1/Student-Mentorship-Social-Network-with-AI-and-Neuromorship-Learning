"""
Cameroon Mentorship Knowledge Base
Simple knowledge base for scholarships and internships in Cameroon
"""

from database import db
from typing import List, Dict, Optional
from datetime import datetime
import re

# MongoDB Collections
scholarships = db["scholarships"]
internships = db["internships"]
knowledge_entries = db["knowledge_entries"]


# ==================== CAMEROON SCHOOLS & SCHOLARSHIPS DATA ====================
CAMEROON_SCHOLARSHIPS = [
    {
        "name": "University of Bamenda",
        "location": "Bamenda, Northwest Region",
        "type": "Public University",
        "programs": ["Computer Science", "Engineering", "Business Administration", "Medicine"],
        "scholarships": [
            {
                "name": "Excellence Scholarship",
                "description": "For top-performing students with GPA above 3.5/4.0",
                "amount": "FCFA 500,000 annually",
                "eligibility": "New students with excellent academic records",
                "deadline": "September 30",
                "website": "https://ub.edu.cm"
            },
            {
                "name": "Need-Based Grant",
                "description": "Financial assistance for students from disadvantaged backgrounds",
                "amount": "FCFA 300,000 annually",
                "eligibility": "Students demonstrating financial need",
                "deadline": "August 15",
                "website": "https://ub.edu.cm"
            }
        ],
        "contact_email": "admissions@ub.edu.cm",
        "established": 1992
    },
    {
        "name": "University of Douala",
        "location": "Douala, Littoral Region",
        "type": "Public University",
        "programs": ["Computer Science", "Mathematics", "Economics", "Medicine", "Law"],
        "scholarships": [
            {
                "name": "Presidential Excellence Award",
                "description": "Top scholarships for outstanding academic achievement",
                "amount": "FCFA 1,000,000 annually",
                "eligibility": "First-year students with distinction",
                "deadline": "October 1",
                "website": "https://univ-douala.cm"
            }
        ],
        "contact_email": "rectorat@univ-douala.cm",
        "established": 1971
    },
    {
        "name": "University of Yaoundé I",
        "location": "Yaoundé, Center Region",
        "type": "Public University",
        "programs": ["Sciences", "Engineering", "Medicine", "Arts", "Law"],
        "scholarships": [
            {
                "name": "MERITE Scholarship",
                "description": "Merit-based scholarship for brilliant students",
                "amount": "FCFA 750,000 annually",
                "eligibility": "Students with exceptional BAC results",
                "deadline": "September 15",
                "website": "https://uy1.uninet.cm"
            }
        ],
        "contact_email": "secretariat@uy1.uninet.cm",
        "established": 1962
    },
    {
        "name": "University of Yaoundé II",
        "location": "Yaoundé, Center Region",
        "type": "Public University",
        "programs": ["Economics", "Management", "Law", "Social Sciences"],
        "scholarships": [
            {
                "name": "Economics Excellence Grant",
                "description": "For students in Economics and Management programs",
                "amount": "FCFA 600,000 annually",
                "eligibility": "Students demonstrating strong analytical skills",
                "deadline": "August 30",
                "website": "https://uy2.uninet.cm"
            }
        ],
        "contact_email": "info@uy2.uninet.cm",
        "established": 1993
    },
    {
        "name": "École Normale Supérieure",
        "location": "Yaoundé, Center Region",
        "type": "Public Higher Teacher Training",
        "programs": ["Education", "Mathematics", "Physics", "Languages"],
        "scholarships": [
            {
                "name": "Future Teachers Scholarship",
                "description": "Full scholarship for students committed to teaching",
                "amount": "Full tuition + monthly allowance",
                "eligibility": "Students enrolling in teacher training programs",
                "deadline": "July 31",
                "website": "https://ens.cm"
            }
        ],
        "contact_email": "contact@ens.cm",
        "established": 1961
    },
    {
        "name": "Cameroon Christian University",
        "location": "Bali, Northwest Region",
        "type": "Private University",
        "programs": ["Theology", "Education", "Business", "Agriculture"],
        "scholarships": [
            {
                "name": "Church Leadership Grant",
                "description": "For students preparing for church leadership roles",
                "amount": "50% tuition reduction",
                "eligibility": "Active church members with recommendation",
                "deadline": "September 1",
                "website": "https://ccuni.edu.cm"
            }
        ],
        "contact_email": "admissions@ccuni.edu.cm",
        "established": 2003
    },
    {
        "name": "Institute of Agricultural and Environmental Sciences",
        "location": "Obala, Center Region",
        "type": "Public Research Institute",
        "programs": ["Agriculture", "Environmental Science", "Forestry"],
        "scholarships": [
            {
                "name": "Green Future Scholarship",
                "description": "For students in sustainable agriculture programs",
                "amount": "FCFA 400,000 annually",
                "eligibility": "Students passionate about environmental conservation",
                "deadline": "August 15",
                "website": "https://irae.cm"
            }
        ],
        "contact_email": "info@irae.cm",
        "established": 1975
    },
    {
        "name": "Advanced School of Engineering",
        "location": "Yaoundé, Center Region",
        "type": "Public Engineering School",
        "programs": ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Computer Engineering"],
        "scholarships": [
            {
                "name": "Engineering Excellence Program",
                "description": "Full scholarship for top engineering candidates",
                "amount": "Full tuition + research grant",
                "eligibility": "Students with strong mathematics and physics",
                "deadline": "July 31",
                "website": "https://ensi.cm"
            }
        ],
        "contact_email": "admissions@ensi.cm",
        "established": 2000
    }
]

# ==================== CAMEROON COMPANIES & INTERNSHIPS DATA ====================
CAMEROON_INTERNSHIPS = [
    {
        "name": "MTN Cameroon",
        "location": "Douala, Littoral Region",
        "industry": "Telecommunications",
        "internship_programs": [
            {
                "title": "Graduate Trainee Program",
                "description": "12-month comprehensive program for recent graduates",
                "departments": ["Technology", "Finance", "Marketing", "Sales"],
                "benefits": "Monthly stipend + training + potential full-time offer",
                "requirements": "Bachelor's degree in relevant field, max 2 years post-graduation",
                "application": "Apply via MTN careers portal",
                "website": "https://careers.mtn.cm"
            },
            {
                "title": "Summer Internship",
                "description": "2-3 month internship for current students",
                "departments": ["IT", "Human Resources", "Operations"],
                "benefits": "Paid internship + mentorship",
                "requirements": "Currently enrolled in university",
                "application": "Apply via MTN careers portal",
                "website": "https://careers.mtn.cm"
            }
        ],
        "contact_email": "careers@mtn.cm",
        "established": 2000
    },
    {
        "name": "Orange Cameroon",
        "location": "Douala, Littoral Region",
        "industry": "Telecommunications",
        "internship_programs": [
            {
                "title": "Orange Graduate Program",
                "description": "18-month program with rotations across departments",
                "departments": ["Network Engineering", "Digital Services", "Business", "Finance"],
                "benefits": "Competitive stipend + international exposure",
                "requirements": "Engineering or Business degree, fluent in French and English",
                "application": "Online application on Orange careers page",
                "website": "https://orange.com/carrieres"
            }
        ],
        "contact_email": "recrutement@orange.cm",
        "established": 2000
    },
    {
        "name": "BICEC (Commercial Bank of Cameroon)",
        "location": "Yaoundé, Center Region",
        "industry": "Banking & Finance",
        "internship_programs": [
            {
                "title": "Banking Internship Program",
                "description": "6-month internship in banking operations",
                "departments": ["Credit Analysis", "Risk Management", "Retail Banking", "Treasury"],
                "benefits": "Monthly allowance + professional training",
                "requirements": "Final year students in Finance, Economics, or related fields",
                "application": "Submit CV to HR department",
                "website": "https://bicec.com"
            }
        ],
        "contact_email": "recrutement@bicec.com",
        "established": 1998
    },
    {
        "name": "Afriland First Bank",
        "location": "Douala, Littoral Region",
        "industry": "Banking & Finance",
        "internship_programs": [
            {
                "title": "Future Bankers Program",
                "description": "Training program for aspiring banking professionals",
                "departments": ["Commercial Banking", "Microfinance", "Investment"],
                "benefits": "Hands-on experience + mentorship from senior bankers",
                "requirements": "Degree in Finance, Accounting, or Business",
                "application": "Email CV to careers@afrilandfirstbank.com",
                "website": "https://afrilandfirstbank.com"
            }
        ],
        "contact_email": "careers@afrilandfirstbank.com",
        "established": 2007
    },
    {
        "name": "JUMIA Cameroon",
        "location": "Douala, Littoral Region",
        "industry": "E-commerce & Technology",
        "internship_programs": [
            {
                "title": "E-commerce Internship",
                "description": "Learn operations of Cameroon's leading e-commerce platform",
                "departments": ["Logistics", "Marketing", "Customer Service", "Tech"],
                "benefits": "Dynamic work environment + performance bonus",
                "requirements": "Passion for e-commerce and technology",
                "application": "Apply on JUMIA careers page",
                "website": "https://careers.jumia.com"
            }
        ],
        "contact_email": "cameroon.recruiting@jumia.com",
        "established": 2013
    },
    {
        "name": "SODECOTON (Cameroon Cotton Development Corporation)",
        "location": "Garoua, North Region",
        "industry": "Agriculture & Manufacturing",
        "internship_programs": [
            {
                "title": "Agricultural Internship",
                "description": "Work in cotton production and agricultural research",
                "departments": ["Agronomy", "Processing", "Quality Control", "Logistics"],
                "benefits": "Rural experience + industry exposure",
                "requirements": "Students in Agriculture or related fields",
                "application": "Contact SODECOTON HR",
                "website": "https://sodecoton.cm"
            }
        ],
        "contact_email": "stage@sodecoton.cm",
        "established": 1974
    },
    {
        "name": "CAMPOST (Cameroon Postal Services)",
        "location": "Yaoundé, Center Region",
        "industry": "Postal & Logistics Services",
        "internship_programs": [
            {
                "title": "Postal Operations Internship",
                "description": "Learn postal and logistics operations nationwide",
                "departments": ["Mail Operations", "Financial Services", "Logistics"],
                "benefits": "Government internship recognition + practical skills",
                "requirements": "Students in Logistics, Management, or related fields",
                "application": "Apply through CAMPOST headquarters",
                "website": "https://campost.cm"
            }
        ],
        "contact_email": "rh@campost.cm",
        "established": 1998
    },
    {
        "name": "CNPS (National Social Insurance Fund)",
        "location": "Yaoundé, Center Region",
        "industry": "Government / Social Security",
        "internship_programs": [
            {
                "title": "Social Security Internship",
                "description": "Learn social security administration and operations",
                "departments": ["Benefits Administration", "Contributions", "IT", "Legal"],
                "benefits": "Government experience + social security knowledge",
                "requirements": "Students in Law, Finance, IT, or Public Administration",
                "application": "Apply via CNPS website",
                "website": "https://cnps.cm"
            }
        ],
        "contact_email": "stage@cnps.cm",
        "established": 1968
    },
    {
        "name": "TotalEnergies Cameroon",
        "location": "Douala, Littoral Region",
        "industry": "Energy & Oil",
        "internship_programs": [
            {
                "title": "Energy Sector Internship",
                "description": "Learn petroleum operations and energy management",
                "departments": ["Exploration", "Refining", "Marketing", "HSE"],
                "benefits": "Industry-leading training + competitive stipend",
                "requirements": "Engineering students in relevant fields",
                "application": "Apply on TotalEnergies careers portal",
                "website": "https://totalenergies.cm/carrieres"
            }
        ],
        "contact_email": "recrutement@totalenergies.cm",
        "established": 1929
    },
    {
        "name": "HELVETIA Cameroon",
        "location": "Douala, Littoral Region",
        "industry": "Insurance",
        "internship_programs": [
            {
                "title": "Insurance Internship",
                "description": "Learn insurance products and risk management",
                "departments": ["Underwriting", "Claims", "Actuarial", "Sales"],
                "benefits": "Professional certification support + mentorship",
                "requirements": "Students in Finance, Actuarial Science, or Business",
                "application": "Submit CV to HR",
                "website": "https://helvetia.cm"
            }
        ],
        "contact_email": "careers@helvetia.cm",
        "established": 2002
    }
]


def init_knowledge_base():
    """Initialize knowledge base collections with sample data"""
    
    # Clear existing data
    scholarships.delete_many({})
    internships.delete_many({})
    knowledge_entries.delete_many({})
    
    # Insert scholarships
    for school in CAMEROON_SCHOLARSHIPS:
        scholarship_doc = {
            "type": "school_scholarship",
            "name": school["name"],
            "location": school["location"],
            "institution_type": school["type"],
            "programs": school["programs"],
            "scholarships": school["scholarships"],
            "contact_email": school["contact_email"],
            "established": school["established"],
            "created_at": datetime.utcnow()
        }
        result = scholarships.insert_one(scholarship_doc)
        school_id = str(result.inserted_id)
        
        # Create searchable knowledge entries
        for scholarship in school["scholarships"]:
            entry = {
                "category": "scholarship",
                "source_type": "school",
                "source_name": school["name"],
                "source_id": school_id,
                "title": f"{school['name']} - {scholarship['name']}",
                "description": scholarship["description"],
                "details": {
                    "amount": scholarship["amount"],
                    "eligibility": scholarship["eligibility"],
                    "deadline": scholarship["deadline"],
                    "website": scholarship["website"],
                    "location": school["location"],
                    "programs": school["programs"]
                },
                "keywords": generate_keywords(school, scholarship),
                "created_at": datetime.utcnow()
            }
            knowledge_entries.insert_one(entry)
    
    # Insert internships
    for company in CAMEROON_INTERNSHIPS:
        internship_doc = {
            "type": "company_internship",
            "name": company["name"],
            "location": company["location"],
            "industry": company["industry"],
            "internship_programs": company["internship_programs"],
            "contact_email": company["contact_email"],
            "established": company["established"],
            "created_at": datetime.utcnow()
        }
        result = internships.insert_one(internship_doc)
        company_id = str(result.inserted_id)
        
        # Create searchable knowledge entries
        for internship in company["internship_programs"]:
            entry = {
                "category": "internship",
                "source_type": "company",
                "source_name": company["name"],
                "source_id": company_id,
                "title": f"{company['name']} - {internship['title']}",
                "description": internship["description"],
                "details": {
                    "departments": internship["departments"],
                    "benefits": internship["benefits"],
                    "requirements": internship["requirements"],
                    "application": internship["application"],
                    "website": internship["website"],
                    "location": company["location"],
                    "industry": company["industry"]
                },
                "keywords": generate_company_keywords(company, internship),
                "created_at": datetime.utcnow()
            }
            knowledge_entries.insert_one(entry)
    
    print(f"✅ Knowledge Base Initialized: {len(CAMEROON_SCHOLARSHIPS)} schools, {len(CAMEROON_INTERNSHIPS)} companies")


def generate_keywords(school: Dict, scholarship: Dict) -> List[str]:
    """Generate searchable keywords for a scholarship entry"""
    keywords = []
    
    # Add school name and variations
    keywords.append(school["name"].lower())
    keywords.extend(school["name"].lower().split())
    
    # Add location
    keywords.append(school["location"].lower())
    
    # Add programs
    keywords.extend([p.lower() for p in school["programs"]])
    
    # Add scholarship type keywords
    keywords.extend(["scholarship", "grant", "fellowship", "award", "financial aid", "tuition"])
    keywords.extend(["excellence", "merit", "need-based", "financial need"])
    
    # Add scholarship name words
    keywords.extend(scholarship["name"].lower().split())
    
    return list(set(keywords))


def generate_company_keywords(company: Dict, internship: Dict) -> List[str]:
    """Generate searchable keywords for an internship entry"""
    keywords = []
    
    # Add company name and variations
    keywords.append(company["name"].lower())
    keywords.extend(company["name"].lower().split())
    
    # Add location
    keywords.append(company["location"].lower())
    
    # Add industry
    keywords.append(company["industry"].lower())
    
    # Add internship type keywords
    keywords.extend(["internship", "trainee", "training", "graduate program", "summer internship"])
    keywords.extend(["job", "work experience", "placement", "apprenticeship"])
    
    # Add department keywords
    keywords.extend([d.lower() for d in internship["departments"]])
    
    return list(set(keywords))


def search_knowledge_base(query: str, category: Optional[str] = None, limit: int = 5) -> List[Dict]:
    """
    Search the knowledge base for relevant entries
    
    Args:
        query: Search query
        category: Filter by 'scholarship' or 'internship' (optional)
        limit: Maximum number of results
    
    Returns:
        List of matching entries
    """
    # Clean and tokenize query
    query_terms = re.findall(r'\w+', query.lower())
    
    # Build search pipeline
    match_stage = {"$or": []}
    
    for term in query_terms:
        if len(term) > 2:  # Skip very short terms
            match_stage["$or"].append({
                "title": {"$regex": term, "$options": "i"}
            })
            match_stage["$or"].append({
                "description": {"$regex": term, "$options": "i"}
            })
            match_stage["$or"].append({
                "keywords": {"$regex": term, "$options": "i"}
            })
    
    # Add category filter if specified
    pipeline = [{"$match": match_stage}]
    if category:
        pipeline.insert(0, {"$match": {"category": category}})
    
    # Add sorting and limit
    pipeline.extend([
        {"$sort": {"created_at": -1}},
        {"$limit": limit}
    ])
    
    # Execute search
    results = list(knowledge_entries.aggregate(pipeline))
    
    return results


def get_scholarships_by_program(program: str) -> List[Dict]:
    """Get all scholarships for a specific program"""
    return list(scholarships.find({
        "programs": {"$regex": program, "$options": "i"}
    }))


def get_internships_by_industry(industry: str) -> List[Dict]:
    """Get all internships in a specific industry"""
    return list(internships.find({
        "industry": {"$regex": industry, "$options": "i"}
    }))


def get_all_scholarships() -> List[Dict]:
    """Get all scholarships"""
    return list(scholarships.find({}))


def get_all_internships() -> List[Dict]:
    """Get all internships"""
    return list(internships.find({}))


def classify_query(query: str) -> str:
    """
    Classify a query as scholarship-related, internship-related, or general
    
    Returns:
        'scholarship', 'internship', or 'general'
    """
    query_lower = query.lower()
    
    scholarship_keywords = [
        "scholarship", "grant", "fellowship", "tuition", "fee", "financial aid",
        "school", "university", "college", "study", "academic", "bursary"
    ]
    
    internship_keywords = [
        "internship", "intern", "trainee", "training", "job", "work experience",
        "company", "employment", "career", "professional", "placement"
    ]
    
    scholarship_count = sum(1 for kw in scholarship_keywords if kw in query_lower)
    internship_count = sum(1 for kw in internship_keywords if kw in query_lower)
    
    if scholarship_count > internship_count:
        return "scholarship"
    elif internship_count > scholarship_count:
        return "internship"
    else:
        return "general"


def generate_response_from_results(query: str, results: List[Dict]) -> str:
    """Generate a natural language response from search results"""
    
    if not results:
        return "I couldn't find any matching information in the knowledge base. Please try a different search term or be more specific."
    
    category = results[0].get("category", "information")
    category_label = "scholarships" if category == "scholarship" else "internship opportunities"
    
    response_parts = []
    response_parts.append(f"Here are some {category_label} I found:")
    response_parts.append("")
    
    for i, result in enumerate(results, 1):
        title = result.get("title", "Unknown")
        description = result.get("description", "")
        details = result.get("details", {})
        
        response_parts.append(f"{i}. **{title}**")
        response_parts.append(f"   {description}")
        
        # Add specific details based on category
        if category == "scholarship":
            amount = details.get("amount", "")
            eligibility = details.get("eligibility", "")
            deadline = details.get("deadline", "")
            website = details.get("website", "")
            
            if amount:
                response_parts.append(f"   💰 Amount: {amount}")
            if eligibility:
                response_parts.append(f"   📋 Eligibility: {eligibility}")
            if deadline:
                response_parts.append(f"   📅 Deadline: {deadline}")
            if website:
                response_parts.append(f"   🔗 Website: {website}")
        else:  # internship
            benefits = details.get("benefits", "")
            requirements = details.get("requirements", "")
            website = details.get("website", "")
            
            if benefits:
                response_parts.append(f"   💼 Benefits: {benefits}")
            if requirements:
                response_parts.append(f"   📋 Requirements: {requirements}")
            if website:
                response_parts.append(f"   🔗 Website: {website}")
        
        response_parts.append("")
    
    # Add call to action
    response_parts.append("Would you like more details about any of these options?")
    
    return "\n".join(response_parts)

