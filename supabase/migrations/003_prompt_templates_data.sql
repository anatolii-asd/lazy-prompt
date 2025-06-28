-- =====================================================
-- Remaining Prompt Templates Data (Templates 12-20)
-- =====================================================

-- Template 12: Financial Analysis
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Financial Analysis Template',
'**Financial Context:**
- Organization type: [Company, personal, nonprofit, etc.]
- Industry: [Relevant sector]
- Time period: [Historical, current, projected]
- Currency: [USD, EUR, etc.]

**Analysis Objective:** [Investment decision, budget planning, performance review]
**Data Available:**
- Financial statements: [Income, balance sheet, cash flow]
- Market data: [Stock prices, benchmarks, ratios]
- Operational metrics: [KPIs, units sold, etc.]

**Key Areas to Analyze:**
- [ ] Profitability analysis
- [ ] Liquidity assessment
- [ ] Debt and leverage
- [ ] Growth trends
- [ ] Efficiency ratios
- [ ] Market comparisons
- [ ] Risk assessment

**Decision Context:** [What decision this analysis will inform]
**Stakeholder Audience:** [Board, investors, management, personal]',
'Finance',
'Template for financial analysis, budgeting, and investment decision-making'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 13: Event Planning
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Event Planning Template',
'**Event Type:** [Conference, workshop, party, launch, meeting]
**Event Scale:** [Number of attendees, duration, complexity]
**Budget Range:** [Total available budget and key constraints]
**Timeline:** [Event date and planning time available]

**Event Objectives:**
- Primary goal: [Main purpose of the event]
- Success metrics: [How you''ll measure success]
- Key outcomes: [What should happen as a result]

**Logistical Requirements:**
- [ ] Venue selection
- [ ] Catering needs
- [ ] Technology/AV requirements
- [ ] Transportation/parking
- [ ] Accommodation (if multi-day)
- [ ] Accessibility considerations

**Audience Details:**
- Demographics: [Age, profession, interests]
- Special needs: [Dietary, accessibility, language]
- Engagement preferences: [Interactive, formal, casual]

**Risk Considerations:** [Weather, cancellations, budget overruns]',
'Project Management',
'Template for planning and organizing events of various types and scales'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 14: Product Development
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Product Development Template',
'**Product Type:** [Physical product, software, service]
**Development Stage:** [Concept, prototype, MVP, enhancement]
**Target Market:** [Demographics, market size, geography]

**Product Vision:**
- Problem solving: [What problem does this address]
- Value proposition: [Why customers will choose this]
- Competitive advantage: [What makes it unique]

**Technical Requirements:**
- Core features: [Must-have functionalities]
- Performance specs: [Speed, capacity, quality standards]
- Platform/technology: [iOS, web, manufacturing specs]
- Integration needs: [APIs, third-party services]

**Development Constraints:**
- Timeline: [Launch date, milestones]
- Budget: [Development costs, ongoing expenses]
- Team: [Available skills, team size]
- Regulatory: [Compliance requirements]

**Success Criteria:** [Sales targets, user adoption, quality metrics]
**Risk Mitigation:** [Technical, market, competitive risks]',
'Product Management',
'Template for product development from concept to launch'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 15: Marketing Campaign
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Marketing Campaign Template',
'**Campaign Objective:** [Brand awareness, lead generation, sales, retention]
**Target Audience:**
- Primary: [Demographics, psychographics, behaviors]
- Secondary: [Additional audience segments]
- Personas: [Detailed buyer profiles if available]

**Campaign Details:**
- Duration: [Start and end dates]
- Budget: [Total budget and allocation]
- Geographic scope: [Local, national, global]
- Channels: [Digital, traditional, hybrid]

**Key Messages:**
- Primary message: [Core value proposition]
- Supporting messages: [Additional benefits, features]
- Call to action: [What you want audience to do]

**Channel Strategy:**
- [ ] Social media (which platforms)
- [ ] Email marketing
- [ ] Paid advertising
- [ ] Content marketing
- [ ] PR/Media outreach
- [ ] Events/partnerships

**Success Metrics:** [CTR, conversions, ROI, brand lift]
**Competitive Context:** [How competitors are positioned]',
'Marketing',
'Template for planning and executing marketing campaigns across various channels'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 16: Legal Document
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Legal Document Template',
'**Document Type:** [Contract, policy, terms, compliance document]
**Legal Jurisdiction:** [Which laws/regulations apply]
**Parties Involved:** [Who is bound by this document]
**Purpose:** [Why this document is needed]

**Key Legal Requirements:**
- Regulatory compliance: [Specific laws to follow]
- Risk mitigation: [What risks to address]
- Rights and obligations: [What each party must do]

**Scope and Coverage:**
- Subject matter: [What the document covers]
- Duration: [Time period of validity]
- Geographic scope: [Where it applies]
- Exceptions: [What''s not covered]

**Special Considerations:**
- [ ] Intellectual property
- [ ] Confidentiality
- [ ] Liability limitations
- [ ] Dispute resolution
- [ ] Termination clauses
- [ ] Force majeure

**Review Requirements:** [Legal review needed, update frequency]
**Audience:** [Who needs to understand this document]',
'Legal',
'Template for creating legal documents, contracts, and compliance materials'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 17: Training Program
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Training Program Template',
'**Training Context:**
- Subject matter: [What skills/knowledge to teach]
- Audience: [Learner demographics, current skill level]
- Training format: [In-person, online, hybrid, self-paced]
- Duration: [Total time commitment]

**Learning Objectives:**
- Primary goals: [What learners should achieve]
- Knowledge areas: [Specific topics to cover]
- Skill development: [Practical abilities to build]
- Behavioral outcomes: [How performance should change]

**Content Structure:**
- [ ] Theoretical foundation
- [ ] Practical exercises
- [ ] Case studies
- [ ] Group activities
- [ ] Individual assessments
- [ ] Reference materials

**Delivery Requirements:**
- Instructor qualifications: [Expertise needed]
- Technology needs: [Software, hardware, platforms]
- Materials: [Handouts, slides, videos]
- Environment: [Classroom, lab, remote setup]

**Assessment Methods:** [Tests, projects, observations]
**Success Metrics:** [Completion rates, skill improvement, job performance]',
'Training',
'Template for designing and implementing training programs and educational curricula'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 18: Process Optimization
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Process Optimization Template',
'**Process Context:**
- Current process: [Detailed description of existing workflow]
- Process owner: [Department, role responsible]
- Frequency: [How often process runs]
- Stakeholders: [Who is involved or affected]

**Performance Issues:**
- Bottlenecks: [Where delays occur]
- Inefficiencies: [Waste, redundancy, errors]
- Cost factors: [Time, money, resources consumed]
- Quality problems: [Defects, inconsistencies]

**Optimization Goals:**
- [ ] Reduce time/cycle time
- [ ] Lower costs
- [ ] Improve quality
- [ ] Increase capacity
- [ ] Enhance user experience
- [ ] Ensure compliance

**Constraints:**
- Budget limitations: [Available resources]
- Technology constraints: [System limitations]
- Regulatory requirements: [Must-follow rules]
- Change management: [Organizational resistance]

**Success Metrics:** [KPIs to measure improvement]
**Implementation Timeline:** [Phases, milestones, deadlines]',
'Operations',
'Template for analyzing and optimizing business processes and workflows'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 19: Competitive Analysis
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Competitive Analysis Template',
'**Analysis Scope:**
- Industry/market: [Specific sector or niche]
- Geographic scope: [Local, national, global markets]
- Time frame: [Historical trends, current state, future outlook]
- Competitive set: [Direct, indirect, substitute competitors]

**Company/Product Focus:**
- Your position: [Current market standing]
- Key competitors: [List 3-5 main competitors]
- New entrants: [Emerging threats or opportunities]

**Analysis Dimensions:**
- [ ] Market share and positioning
- [ ] Product/service offerings
- [ ] Pricing strategies
- [ ] Marketing and branding
- [ ] Operational capabilities
- [ ] Financial performance
- [ ] Technology and innovation

**Intelligence Sources:**
- Public information: [Annual reports, press releases]
- Market research: [Industry reports, surveys]
- Customer feedback: [Reviews, testimonials]
- Direct observation: [Store visits, website analysis]

**Strategic Questions:** [What specific insights you need]
**Decision Impact:** [How this analysis will be used]',
'Strategy',
'Template for comprehensive competitive intelligence and market analysis'
) ON CONFLICT (template_name) DO NOTHING;

-- Template 20: Risk Assessment
INSERT INTO prompt_templates (template_name, template_body, category, description) VALUES (
'Risk Assessment Template',
'**Risk Context:**
- Organization/project: [What you''re assessing risk for]
- Scope: [Operational, financial, strategic, technical risks]
- Time horizon: [Short-term, medium-term, long-term]
- Assessment purpose: [Compliance, planning, insurance]

**Risk Categories to Evaluate:**
- [ ] Financial risks
- [ ] Operational risks
- [ ] Strategic risks
- [ ] Compliance/regulatory risks
- [ ] Technology risks
- [ ] Market risks
- [ ] Reputational risks

**Risk Analysis Framework:**
- Probability scale: [How you''ll measure likelihood]
- Impact scale: [How you''ll measure consequences]
- Risk tolerance: [Acceptable vs. unacceptable risk levels]

**Current Controls:**
- Existing safeguards: [What protections are in place]
- Control effectiveness: [How well they''re working]
- Gaps identified: [Where additional protection is needed]

**Mitigation Requirements:**
- Priority risks: [Most critical to address]
- Resource constraints: [Budget, time, personnel limits]
- Implementation timeline: [When mitigation must be complete]',
'Risk Management',
'Template for identifying, analyzing, and mitigating various types of organizational risks'
) ON CONFLICT (template_name) DO NOTHING;