const db = require("../models");
const Resume = db.resumes;

// Common ATS keywords by industry
const ATS_KEYWORDS = {
    'it': [
        'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue.js', 'sql', 'mongodb',
        'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'devops', 'ci/cd',
        'machine learning', 'artificial intelligence', 'data analysis', 'api', 'rest', 'graphql',
        'typescript', 'php', 'ruby', 'c++', 'c#', '.net', 'spring', 'express', 'django', 'flask'
    ],
    'accountant': [
        'quickbooks', 'xero', 'sage', 'peachtree', 'excel', 'financial statements', 'audit',
        'tax preparation', 'bookkeeping', 'general ledger', 'accounts payable', 'accounts receivable',
        'payroll', 'budgeting', 'forecasting', 'cost accounting', 'managerial accounting',
        'gaap', 'ifrs', 'internal controls', 'financial analysis', 'variance analysis'
    ],
    'business': [
        'project management', 'leadership', 'strategic planning', 'market analysis', 'business development',
        'sales', 'marketing', 'customer relationship management', 'crm', 'salesforce', 'hubspot',
        'financial modeling', 'budgeting', 'forecasting', 'process improvement', 'lean', 'six sigma',
        'stakeholder management', 'risk management', 'compliance', 'operations management'
    ],
    'engineering': [
        'autocad', 'solidworks', 'revit', 'matlab', 'ansys', 'project management', 'design',
        'structural analysis', 'mechanical design', 'electrical systems', 'plc', 'scada',
        'hvac', 'construction management', 'quality control', 'safety', 'regulations', 'standards'
    ],
    'generic': [
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical skills',
        'project management', 'customer service', 'sales', 'marketing', 'research',
        'data analysis', 'microsoft office', 'excel', 'powerpoint', 'word'
    ]
};

// ATS formatting rules
// const ATS_FORMATTING_RULES = {
//     'font': ['Arial', 'Calibri', 'Times New Roman', 'Georgia'],
//     'fontSize': { min: 10, max: 12 },
//     'sections': ['contact', 'summary', 'experience', 'education', 'skills'],
//     'avoidElements': ['tables', 'images', 'graphics', 'columns', 'headers', 'footers'],
//     'keywords': { minDensity: 2, maxDensity: 5 }
// };

// Analyze resume for ATS compatibility
exports.analyzeResume = async (req, res) => {
    try {
        console.log('ATS Analysis Request:', req.body);
        const { resumeId, jobTitle, industry } = req.body;
        const userId = req.userId;

        console.log('Looking for resume:', resumeId, 'for user:', userId);

        // Get resume data
        const resume = await Resume.findOne({
            where: { id: resumeId, userId: userId }
        });

        if (!resume) {
            console.log('Resume not found');
            return res.status(404).send({ message: "Resume not found." });
        }

        console.log('Resume found:', resume.title);
        console.log('Resume content type:', typeof resume.content);
        console.log('Resume content keys:', Object.keys(resume.content || {}));

        const content = resume.content;
        const analysis = await performATSAnalysis(content, jobTitle, industry);

        console.log('Analysis completed, score:', analysis.score);
        res.status(200).send(analysis);
    } catch (err) {
        console.error('ATS Analysis Error:', err);
        res.status(500).send({ message: err.message });
    }
};

// Perform comprehensive ATS analysis
async function performATSAnalysis(content, jobTitle, industry) {
    const text = extractTextFromContent(content);
    const keywords = getKeywordsForIndustry(industry);
    const jobKeywords = extractKeywordsFromJobTitle(jobTitle);
    
    const analysis = {
        score: 0,
        keywordMatch: {
            found: [],
            missing: [],
            score: 0
        },
        formatting: {
            issues: [],
            score: 0
        },
        structure: {
            issues: [],
            score: 0
        },
        recommendations: []
    };

    // Keyword Analysis
    const keywordAnalysis = analyzeKeywords(text, keywords, jobKeywords);
    analysis.keywordMatch = keywordAnalysis;
    analysis.score += keywordAnalysis.score * 0.4; // 40% weight

    // Formatting Analysis
    const formattingAnalysis = analyzeFormatting(text);
    analysis.formatting = formattingAnalysis;
    analysis.score += formattingAnalysis.score * 0.3; // 30% weight

    // Structure Analysis
    const structureAnalysis = analyzeStructure(content);
    analysis.structure = structureAnalysis;
    analysis.score += structureAnalysis.score * 0.3; // 30% weight

    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis);

    return analysis;
}

// Extract text from resume content
function extractTextFromContent(content) {
    let text = '';
    
    try {
        if (!content) {
            console.log('Content is null or undefined');
            return '';
        }
        
        if (content.name) text += content.name + ' ';
        if (content.title) text += content.title + ' ';
        if (content.summary) text += content.summary + ' ';
        if (content.email) text += content.email + ' ';
        if (content.phone) text += content.phone + ' ';
        
        if (content.skills && Array.isArray(content.skills)) {
            content.skills.forEach(skillGroup => {
                if (skillGroup && skillGroup.items && Array.isArray(skillGroup.items)) {
                    text += skillGroup.items.join(' ') + ' ';
                }
            });
        }
        
        if (content.experience && Array.isArray(content.experience)) {
            content.experience.forEach(exp => {
                if (exp && typeof exp === 'object') {
                    if (exp.company) text += exp.company + ' ';
                    if (exp.position) text += exp.position + ' ';
                    if (exp.description) text += exp.description + ' ';
                }
            });
        }
        
        if (content.projects && Array.isArray(content.projects)) {
            content.projects.forEach(project => {
                if (project && typeof project === 'object') {
                    if (project.title) text += project.title + ' ';
                    if (project.tech) text += project.tech + ' ';
                    if (project.description) text += project.description + ' ';
                }
            });
        }
        
        console.log('Extracted text length:', text.length);
        return text.toLowerCase();
    } catch (error) {
        console.error('Error extracting text from content:', error);
        return '';
    }
}

// Get keywords for specific industry
function getKeywordsForIndustry(industry) {
    return ATS_KEYWORDS[industry] || ATS_KEYWORDS.generic;
}

// Extract keywords from job title
function extractKeywordsFromJobTitle(jobTitle) {
    if (!jobTitle) return [];
    
    const commonJobKeywords = {
        'developer': ['programming', 'coding', 'development', 'software'],
        'engineer': ['engineering', 'technical', 'design', 'analysis'],
        'manager': ['management', 'leadership', 'supervision', 'coordination'],
        'analyst': ['analysis', 'research', 'data', 'reporting'],
        'specialist': ['specialization', 'expertise', 'focus', 'concentration'],
        'coordinator': ['coordination', 'organization', 'planning', 'scheduling'],
        'assistant': ['support', 'assistance', 'coordination', 'administration'],
        'director': ['leadership', 'strategy', 'management', 'oversight'],
        'consultant': ['consulting', 'advisory', 'expertise', 'analysis']
    };
    
    const jobTitleLower = jobTitle.toLowerCase();
    let keywords = [];
    
    Object.keys(commonJobKeywords).forEach(key => {
        if (jobTitleLower.includes(key)) {
            keywords = keywords.concat(commonJobKeywords[key]);
        }
    });
    
    return keywords;
}

// Analyze keyword matching
function analyzeKeywords(text, industryKeywords, jobKeywords) {
    const allKeywords = [...industryKeywords, ...jobKeywords];
    const foundKeywords = [];
    const missingKeywords = [];
    
    allKeywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            foundKeywords.push(keyword);
        } else {
            missingKeywords.push(keyword);
        }
    });
    
    const score = (foundKeywords.length / allKeywords.length) * 100;
    
    return {
        found: foundKeywords,
        missing: missingKeywords,
        score: Math.min(score, 100)
    };
}

// Analyze formatting issues
function analyzeFormatting(text) {
    const issues = [];
    let score = 100;
    
    // Check for common formatting issues
    if (text.includes('table')) {
        issues.push('Avoid using tables - ATS systems may not parse them correctly');
        score -= 20;
    }
    
    if (text.includes('image') || text.includes('graphic')) {
        issues.push('Remove images and graphics - ATS systems cannot read them');
        score -= 15;
    }
    
    if (text.includes('header') || text.includes('footer')) {
        issues.push('Avoid headers and footers - they may not be parsed by ATS');
        score -= 10;
    }
    
    // Check for excessive formatting
    const formattingWords = ['bold', 'italic', 'underline', 'color', 'font'];
    formattingWords.forEach(word => {
        if (text.includes(word)) {
            issues.push('Use simple formatting - avoid excessive styling');
            score -= 5;
        }
    });
    
    return {
        issues: issues,
        score: Math.max(score, 0)
    };
}

// Analyze resume structure
function analyzeStructure(content) {
    const issues = [];
    let score = 100;
    
    try {
        if (!content) {
            issues.push('No resume content found');
            return {
                issues: issues,
                score: 0
            };
        }
        
        const requiredSections = ['experience', 'education'];
        const contentKeys = Object.keys(content);

        // Contact check (look for name, email, phone instead of 'contact')
        if (!content.name && !content.email && !content.phone) {
            issues.push("Missing contact section");
            score -= 20;
        }

        requiredSections.forEach(section => {
            if (!contentKeys.some(key => key.includes(section))) {
                issues.push(`Missing ${section} section`);
                score -= 20;
            }
        });
        
        // Check for content quality
        if (content.summary && content.summary.length < 50) {
            issues.push('Professional summary is too short - aim for 2-3 sentences');
            score -= 10;
        }
        
        if (content.experience && Array.isArray(content.experience) && content.experience.length === 0) {
            issues.push('No work experience listed');
            score -= 30;
        }
        
        if (content.skills && Array.isArray(content.skills) && content.skills.length === 0) {
            issues.push('No skills listed');
            score -= 15;
        }
        
        return {
            issues: issues,
            score: Math.max(score, 0)
        };
    } catch (error) {
        console.error('Error analyzing structure:', error);
        return {
            issues: ['Error analyzing resume structure'],
            score: 0
        };
    }
}

// Generate optimization recommendations
function generateRecommendations(analysis) {
    const recommendations = [];
    
    // Keyword recommendations
    if (analysis.keywordMatch.missing.length > 0) {
        recommendations.push({
            type: 'keyword',
            priority: 'high',
            title: 'Add Missing Keywords',
            description: `Include these keywords in your resume: ${analysis.keywordMatch.missing.slice(0, 5).join(', ')}`,
            action: 'Add relevant keywords to your experience and skills sections'
        });
    }
    
    // Formatting recommendations
    analysis.formatting.issues.forEach(issue => {
        recommendations.push({
            type: 'formatting',
            priority: 'medium',
            title: 'Fix Formatting Issue',
            description: issue,
            action: 'Update resume formatting to be ATS-friendly'
        });
    });
    
    // Structure recommendations
    analysis.structure.issues.forEach(issue => {
        recommendations.push({
            type: 'structure',
            priority: 'high',
            title: 'Improve Resume Structure',
            description: issue,
            action: 'Add missing sections or improve content quality'
        });
    });
    
    // General recommendations based on score
    if (analysis.score < 60) {
        recommendations.push({
            type: 'general',
            priority: 'high',
            title: 'Major Improvements Needed',
            description: 'Your resume needs significant improvements to pass ATS screening',
            action: 'Consider a complete resume overhaul focusing on keywords and structure'
        });
    } else if (analysis.score < 80) {
        recommendations.push({
            type: 'general',
            priority: 'medium',
            title: 'Minor Improvements Needed',
            description: 'Your resume is mostly ATS-friendly but could use some improvements',
            action: 'Focus on adding relevant keywords and improving content quality'
        });
    } else {
        recommendations.push({
            type: 'general',
            priority: 'low',
            title: 'Excellent ATS Compatibility',
            description: 'Your resume is well-optimized for ATS systems',
            action: 'Maintain current formatting and continue to update keywords for specific jobs'
        });
    }
    
    return recommendations;
}

// Get ATS score for a resume
exports.getATSScore = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const userId = req.userId;

        const resume = await Resume.findOne({
            where: { id: resumeId, userId: userId }
        });

        if (!resume) {
            return res.status(404).send({ message: "Resume not found." });
        }

        const analysis = await performATSAnalysis(resume.content, '', 'generic');
        
        res.status(200).send({
            score: analysis.score,
            grade: getScoreGrade(analysis.score)
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get score grade
function getScoreGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

// Get industry-specific keywords
exports.getIndustryKeywords = async (req, res) => {
    try {
        const { industry } = req.params;
        const keywords = getKeywordsForIndustry(industry);
        
        res.status(200).send({
            industry: industry,
            keywords: keywords
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Test endpoint to verify ATS controller is working
exports.testATS = async (req, res) => {
    try {
        res.status(200).send({ 
            message: "ATS Controller is working!",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}; 