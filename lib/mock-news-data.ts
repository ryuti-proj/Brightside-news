"use client"

import type { NewsArticle } from "./news-api"

// High-quality Unsplash images for different categories
const categoryImages: Record<string, string[]> = {
  "Inspirational Stories": [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Health & Wellbeing": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Community & Kindness": [
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  Environment: [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Science & Breakthroughs": [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  Children: [
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1519340333755-56e9c1d3611a?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Arts & Culture": [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Animals & Wildlife": [
    "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  Education: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  Technology: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Sports & Wellness": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Social Impact": [
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Good Business": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Everyday Heroes": [
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&auto=format&q=80",
  ],
  "Uplifting World": [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop&auto=format&q=80",
  ],
}

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "Kenya",
  "Tanzania",
  "South Africa",
  "Mexico",
  "Argentina",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "New Zealand",
  "Thailand",
  "Philippines",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "China",
  "South Korea",
  "Russia",
  "Turkey",
  "Egypt",
  "Morocco",
  "Nigeria",
  "Ghana",
  "Chile",
  "Peru",
  "Colombia",
  "Ecuador",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Venezuela",
  "Costa Rica",
  "Panama",
  "Guatemala",
  "Honduras",
  "Nicaragua",
  "El Salvador",
  "Belize",
  "Jamaica",
  "Trinidad and Tobago",
  "Barbados",
  "Bahamas",
  "Cuba",
  "Dominican Republic",
  "Haiti",
  "Puerto Rico",
  "Switzerland",
  "Austria",
  "Belgium",
  "Denmark",
  "Finland",
  "Iceland",
  "Ireland",
  "Portugal",
  "Greece",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Croatia",
  "Serbia",
  "Ukraine",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Nepal",
  "Myanmar",
  "Cambodia",
  "Laos",
  "Mongolia",
  "Kazakhstan",
  "Uzbekistan",
  "Iran",
  "Iraq",
  "Jordan",
  "Lebanon",
  "Israel",
  "Saudi Arabia",
  "UAE",
  "Qatar",
  "Kuwait",
  "Oman",
  "Yemen",
  "Ethiopia",
  "Uganda",
  "Rwanda",
  "Zambia",
  "Zimbabwe",
  "Botswana",
  "Namibia",
  "Angola",
  "Cameroon",
  "Ivory Coast",
  "Senegal",
  "Mali",
  "Burkina Faso",
  "Niger",
  "Chad",
  "Sudan",
  "Libya",
  "Tunisia",
  "Algeria",
  "Madagascar",
  "Mauritius",
  "Seychelles",
  "Fiji",
  "Papua New Guinea",
  "Solomon Islands",
  "Vanuatu",
  "Samoa",
  "Tonga",
]

const categories = [
  "Inspirational Stories",
  "Health & Wellbeing",
  "Community & Kindness",
  "Environment",
  "Science & Breakthroughs",
  "Children",
  "Arts & Culture",
  "Animals & Wildlife",
  "Education",
  "Technology",
  "Sports & Wellness",
  "Social Impact",
  "Good Business",
  "Everyday Heroes",
  "Uplifting World",
]

const positiveHeadlines = [
  "Local Community Comes Together to Build Playground for Children with Disabilities",
  "Scientists Develop Revolutionary Water Purification System for Remote Villages",
  "Young Entrepreneur Creates App to Connect Elderly with Tech-Savvy Volunteers",
  "City Plants 10,000 Trees in Urban Renewal Project Led by Students",
  "Hospital Staff Surprise Cancer Patient with Dream Wedding Ceremony",
  "Retired Teacher Opens Free Library in Underserved Neighborhood",
  "Marine Biologists Successfully Restore Coral Reef Using Innovative Technique",
  "Local Restaurant Provides Free Meals to Healthcare Workers During Crisis",
  "Artist Creates Beautiful Murals to Brighten Up Senior Living Facility",
  "Volunteers Build Wheelchair-Accessible Garden for Therapy Center",
  "Tech Company Donates Computers to Schools in Rural Areas",
  "Community Garden Brings Neighbors Together and Reduces Food Insecurity",
  "Student Invents Device to Help Visually Impaired Navigate Safely",
  "Local Business Owners Create Job Training Program for At-Risk Youth",
  "Doctors Perform Life-Changing Surgery on Child from Developing Country",
  "Environmental Group Successfully Cleans Up Polluted River",
  "Musicians Organize Concert Series to Support Local Food Bank",
  "Engineers Design Solar-Powered Water Wells for African Villages",
  "Neighbors Rally to Save Family Farm from Financial Hardship",
  "School Children Raise Funds to Build Playground in Sister City",
  "Veterinarians Provide Free Care for Pets of Homeless Individuals",
  "Community Center Offers Free Coding Classes for Underprivileged Kids",
  "Local Heroes Rescue Stranded Animals During Natural Disaster",
  "Artists Transform Abandoned Building into Community Art Space",
  "Medical Breakthrough Offers Hope for Rare Disease Patients",
  "Volunteers Create Mobile Library to Serve Remote Communities",
  "Students Design Prosthetic Limbs Using 3D Printing Technology",
  "Community Rallies to Support Single Mother's Education Dreams",
  "Environmental Initiative Turns Plastic Waste into Building Materials",
  "Local Chef Teaches Cooking Skills to Help People Eat Healthier",
  "Breakthrough Treatment Helps Paralyzed Patients Regain Movement",
  "Neighborhood Watch Program Reduces Crime and Builds Community",
  "Young Activists Successfully Campaign for Cleaner Air in Their City",
  "Doctors Use Virtual Reality to Help Children Cope with Medical Procedures",
  "Community Garden Project Transforms Vacant Lot into Green Oasis",
  "Local Business Creates Jobs for People with Developmental Disabilities",
  "Scientists Develop New Method to Remove Ocean Plastic Pollution",
  "Volunteers Build Homes for Families Affected by Natural Disasters",
  "School Program Pairs Students with Senior Citizens for Mutual Learning",
  "Innovative Therapy Program Helps Veterans Overcome PTSD",
  "Community Kitchen Provides Nutritious Meals to Food-Insecure Families",
  "Young Inventor Creates Device to Detect Water Contamination",
  "Local Artists Beautify Underpass with Inspiring Community Mural",
  "Medical Team Performs Groundbreaking Surgery to Separate Conjoined Twins",
  "Environmental Group Plants Native Species to Restore Wildlife Habitat",
  "Volunteers Teach Digital Literacy to Senior Citizens",
  "Students Create Sustainable Energy Solution for Rural School",
  "Community Comes Together to Support Refugee Families",
  "Breakthrough Research Offers New Hope for Alzheimer's Patients",
  "Local Initiative Provides Free Bicycles to Low-Income Workers",
]

const positiveExcerpts = [
  "This heartwarming initiative demonstrates the power of community collaboration and the impact of inclusive design on children's lives.",
  "The innovative technology promises to provide clean drinking water to millions of people in remote areas around the world.",
  "The intergenerational program bridges the digital divide while creating meaningful connections between young and old.",
  "Students lead environmental change in their city, creating green spaces that will benefit the community for generations.",
  "Healthcare heroes go above and beyond to bring joy and hope to patients during their most challenging times.",
  "Education advocate transforms neighborhood by making books and learning accessible to all community members.",
  "Cutting-edge marine conservation efforts show promising results in restoring damaged ocean ecosystems.",
  "Local business demonstrates community spirit by supporting frontline workers during difficult times.",
  "Creative expression brings color and joy to seniors while fostering intergenerational connections.",
  "Inclusive design creates therapeutic spaces that welcome people of all abilities to enjoy nature.",
  "Corporate social responsibility initiative helps bridge the digital divide in education.",
  "Sustainable agriculture project addresses food security while strengthening neighborhood bonds.",
  "Young innovator's invention improves safety and independence for people with visual impairments.",
  "Public-private partnership creates pathways to employment for underserved youth populations.",
  "International medical mission brings life-changing treatment to children in need.",
  "Grassroots environmental action successfully restores natural waterway to health.",
  "Arts community mobilizes to address hunger and food insecurity through creative fundraising.",
  "Engineering innovation brings sustainable energy solutions to communities without reliable electricity.",
  "Community solidarity helps preserve agricultural heritage and family livelihoods.",
  "International friendship project connects children across cultures through shared play spaces.",
  "Compassionate veterinary care ensures that pet ownership remains possible for vulnerable populations.",
  "Educational equity initiative provides technology skills training to underserved communities.",
  "Emergency response volunteers risk their own safety to protect vulnerable animals.",
  "Urban renewal project transforms neglected spaces into vibrant community gathering places.",
  "Scientific advancement brings new treatment options to patients with previously incurable conditions.",
  "Mobile education initiative ensures that geographic isolation doesn't limit access to books and learning.",
  "Student innovation combines technology and compassion to improve quality of life for amputees.",
  "Scholarship program and community support help single parent achieve educational goals.",
  "Circular economy solution addresses waste management while creating sustainable building materials.",
  "Culinary education program promotes health and nutrition in underserved communities.",
  "Medical breakthrough offers hope for spinal cord injury patients to regain mobility.",
  "Community policing initiative builds trust and safety through neighbor collaboration.",
  "Youth environmental advocacy leads to policy changes that improve air quality for all residents.",
  "Innovative medical technology helps reduce anxiety and trauma for young patients.",
  "Urban agriculture project creates green space while addressing food access issues.",
  "Inclusive employment program creates opportunities for people with disabilities to contribute their talents.",
  "Environmental engineering solution tackles ocean pollution through innovative cleanup methods.",
  "Disaster relief volunteers provide shelter and hope to families rebuilding their lives.",
  "Intergenerational program creates mutual learning opportunities that benefit both students and seniors.",
  "Mental health innovation provides new treatment options for veterans struggling with trauma.",
  "Community nutrition program ensures that healthy food is accessible to all families.",
  "Environmental monitoring technology helps communities protect their water resources.",
  "Public art project transforms infrastructure into inspiring community landmarks.",
  "Surgical innovation and international collaboration give conjoined twins a chance at independent lives.",
  "Habitat restoration project creates homes for wildlife while educating the community about conservation.",
  "Technology education program helps seniors stay connected with family and access important services.",
  "Renewable energy project provides sustainable power while teaching students about environmental stewardship.",
  "Refugee resettlement program demonstrates the power of community welcome and support.",
  "Neuroscience research breakthrough offers new hope for families affected by dementia.",
  "Transportation equity initiative helps low-income workers access employment opportunities.",
]

function getRandomImage(category: string): string {
  const images = categoryImages[category] || categoryImages["Inspirational Stories"]
  return images[Math.floor(Math.random() * images.length)]
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getRandomDate(): string {
  const now = new Date()
  const hoursAgo = Math.floor(Math.random() * 72) // 0-72 hours ago
  const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

  if (hoursAgo < 1) return "Just now"
  if (hoursAgo < 24) return `${hoursAgo} hours ago`

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo === 1) return "1 day ago"
  return `${daysAgo} days ago`
}

export function generateMockNews(count = 1000): NewsArticle[] {
  const articles: NewsArticle[] = []

  for (let i = 0; i < count; i++) {
    const category = getRandomElement(categories)
    const country = getRandomElement(countries)
    const headline = getRandomElement(positiveHeadlines)
    const excerpt = getRandomElement(positiveExcerpts)

    articles.push({
      id: generateId(),
      title: headline,
      excerpt: excerpt,
      content: `${excerpt} This inspiring story showcases the incredible impact that dedicated individuals and communities can have when they come together for a common cause. The initiative has already begun to show positive results, with participants reporting increased hope, improved conditions, and stronger community bonds. Local leaders praise the effort as a model for other communities to follow, demonstrating that positive change is possible when people work together with determination and compassion.`,
      category: category,
      country: country,
      image: getRandomImage(category),
      publishedAt: getRandomDate(),
      readTime: `${Math.floor(Math.random() * 5) + 2} min read`,
      likes: Math.floor(Math.random() * 500) + 50,
      isFeatured: Math.random() < 0.1, // 10% chance of being featured
      source: `${country} News Network`,
      author: `${getRandomElement(["Sarah", "Michael", "Emma", "David", "Lisa", "James", "Maria", "John", "Anna", "Robert"])} ${getRandomElement(["Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"])}`,
    })
  }

  return articles
}

export const mockNewsData = generateMockNews(1000)
