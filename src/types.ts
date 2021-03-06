export interface DocumentConfig {
  margins: Margins;
  pageSize: PageSize;
  fontConfig: FontConfig;
  currentY: number;
  sectionTitleSpacing: number;
  sectionTextSpacing: number;
  sectionEndSpacing: number;
  content: ContentConfig;
}

interface Margins {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface PageSize {
  height: number;
  width: number;
}

export interface FontConfig {
  titleSize: number;
  textSize: number;
}

export interface HeaderConfig {
  name: string;
  phone: string;
  email: string;
}

export interface SummaryConfig {
  description: string;
}

export interface TopSkillsConfig {
  skills: string[];
}

export interface ExperienceConfig {
  exp: JobPosition[];
}

export interface JobPosition {
  company: string;
  position: string;
  year_start: string;
  year_end: string;
  bullets: string[];
}

export interface EducationConfig {
  school: string;
  degree: string;
  gpa: string;
  grad_year: string;
}

export interface ContentConfig {
  header: HeaderConfig;
  summary: SummaryConfig;
  top_skills: TopSkillsConfig;
  experience: ExperienceConfig;
  education: EducationConfig;
}
