import {jsPDF, TextOptionsLight} from 'jspdf'
import {DocumentConfig, FontConfig} from "./index";

export function AddHeader(file: jsPDF, docConfig: DocumentConfig, config: HeaderConfig) {
    const { name, phone, email } = config
    SetSectionCurrentY(file, docConfig, name)
    const { margins: {top, right}, pageSize: {width} } = docConfig
    const lineHeight = file.getLineHeight() / 72
    const y_delta = lineHeight // use 1 lineHeight because it's only added once in text adds below
    ParseForBold(file, `Phone: **${phone}**`, width - right, top, {align:"right"} )
    ParseForBold(file, `Email: **${email}**`, width - right, top + lineHeight, {align:"right"} )

    EndSectionWithLine(file, docConfig, y_delta)
}

export function AddSummary(file: jsPDF, docConfig: DocumentConfig, config: SummaryConfig) {
    SetSectionCurrentY(file, docConfig, "Summary")
    const { margins: {left, right}, pageSize: {width}, currentY} = docConfig
    const {description} = config
    const summary = file.splitTextToSize(description, width - left - right + 0.5)
    const lineHeight = file.getLineHeight() / 72
    let local_y = currentY
    let y_delta = 0

    summary.map((x:string, i:number) => {
        y_delta = (lineHeight * i)
        ParseForBold(file, x, left, local_y + y_delta)
    })

    EndSectionWithLine(file, docConfig, y_delta)
}

export function AddTopSkills(file: jsPDF, docConfig: DocumentConfig, config: TopSkillsConfig) {
    SetSectionCurrentY(file, docConfig, "Top Skills")
    const { margins: {left}, pageSize:{width}, currentY, fontConfig} = docConfig
    const {skills} = config
    let local_y = currentY
    const lineHeight = (file.getLineHeight() / 72)
    const y_delta = lineHeight * 2 // Multiply by 2 because table rows are 2

    // Add 6 Skills
    const cellWidth = (width / 3) - 0.3
    const leftTableStart = left + 0.6
    const textConfig: TextOptionsLight = {
        align: 'center',
        lineHeightFactor: 1.9
    }
    SetFont(file, fontConfig, 'top_skills_table')
    file.text([skills[0],skills[3]], leftTableStart, local_y, textConfig)
    file.text([skills[1],skills[4]], leftTableStart + (cellWidth), local_y, textConfig)
    file.text([skills[2],skills[5]], leftTableStart + (cellWidth * 2), local_y, textConfig)
    SetFont(file, fontConfig)
    EndSectionWithLine(file, docConfig, y_delta)
}

export function AddExperience(file: jsPDF, docConfig: DocumentConfig, config: ExperienceConfig) {
    SetSectionCurrentY(file, docConfig, "Experience")
    const { margins: {left, right}, pageSize:{width}, currentY} = docConfig
    const lineHeight = file.getLineHeight() / 72
    let local_y = currentY
    config.exp.forEach(AddJob)

    function AddJob(data: JobPosition) {
        const y = local_y
        const {company, position, year_start, year_end, bullets} = data
        const lineOne = ` : \u0009 **${position}**`
        const timeThere = `[ ${year_start} - ${year_end} ]`
        file.setFont('helvetica','italic')
        file.text(company, left, y)
        const companyInchWidth = file.getStringUnitWidth(company) * file.getFontSize() / 72
        ParseForBold(file, lineOne, left + companyInchWidth , y)
        file.text(timeThere, width - right, y, {align:"right"})
        const bulletsWithPoints = bullets.map(x => {
            return '    \u0090  ' + x
        })
        let bulletsToSize = ['']
        bulletsWithPoints.forEach(x => {
            const split = file.splitTextToSize(x, width - left - right).map((line: string, i: number) => {
                if(i > 0) {
                    return "       " + line
                } else {
                    return line
                }
            })
            bulletsToSize = bulletsToSize.concat(split)
        })
        file.text(bulletsToSize, left, y + 0.05)
        const numOfLines = 1 + bulletsToSize.length // Need to add 1 so there is a space between each job
        local_y = local_y + (numOfLines * lineHeight)
    }
    const y_delta = local_y - currentY - lineHeight // Subtract 1 lineHeight for the end of the section
    EndSectionWithLine(file, docConfig, y_delta)
}

export function AddEducation(file: jsPDF, docConfig: DocumentConfig, config: EducationConfig) {
    SetSectionCurrentY(file, docConfig, "Education")
    const { margins: {left, right}, pageSize:{width}, currentY} = docConfig
    const {school, degree, gpa, grad_year} = config
    let local_y = currentY
    const lineHeight = file.getLineHeight() / 72
    const y_delta = lineHeight * 3 // Multiply by 3 because 3 lines are taken with school, degree and gpa

    file.text([school, degree, gpa], left, local_y)
    file.text(`[ ${grad_year} ]`, width - right, local_y, {align:"right"})

    EndSectionWithLine(file, docConfig, y_delta)
}

function ParseForBold(file: jsPDF, text: string, x:number, y: number, options?: any) {
    let startX = x
    const fontSize = file.getFontSize()
    let parseForBold = text.split('**')
    if(options && options.align === 'right'){
        parseForBold = parseForBold.reverse()
    }
    parseForBold.map((x, i) => {
        file.setFont("helvetica","bold");
        // every even item is a normal font weight item
        if (i % 2 === 0) {
            file.setFont("helvetica","normal");
        }
        file.text(x, startX, y, options);
        if(options && options.align === 'right') {
            startX = startX - file.getStringUnitWidth(x) * fontSize / 72;
        } else {
            startX = startX + file.getStringUnitWidth(x) * fontSize / 72;
        }
    })
}

function TwoDigits(value: number) {
    return Math.round(value * 100) / 100
}

function AddSectionTitle(file: jsPDF, title: string, x: number, y: number, fontConfig: FontConfig) {
    SetFont(file, fontConfig, 'section_title')
    file.text(title.toUpperCase(), x, y )
    SetFont(file, fontConfig)
}

function EndSectionWithLine(file: jsPDF, docConfig: DocumentConfig, y: number) {
    const {
        margins: { left, right, top },
        pageSize: {width},
        currentY,
        sectionTextSpacing,
        sectionEndSpacing
    } = docConfig
    const local_y = currentY === top + sectionTextSpacing ? currentY + y : currentY + y + sectionEndSpacing
    file.lines([ [width - left - right, 0] ], left, local_y, [1,1])

    // Update the currentY in config after adding line
    docConfig.currentY = local_y
}

function SetSectionCurrentY(file: jsPDF, config: DocumentConfig, sectionTitle: string) {
    const {currentY, sectionTitleSpacing, sectionTextSpacing, margins: {top, left}, fontConfig} = config

    let local_y = currentY ? currentY : top
    local_y = TwoDigits(local_y)

    if(currentY) local_y = local_y + sectionTitleSpacing
    AddSectionTitle(file, sectionTitle, left, local_y, fontConfig)

    local_y = local_y + sectionTextSpacing

    config.currentY = TwoDigits(local_y)
}

function SetFont(file: jsPDF, fontConfig: FontConfig, type?: string) {
    const {titleSize, textSize} = fontConfig
    switch (type) {
        case 'section_title': {
            file.setFont('helvetica', 'bold')
            file.setFontSize(titleSize)
            break
        }
        case 'top_skills_table': {
            file.setFont('helvetica', 'bold')
            file.setFontSize(textSize)
            break
        }
        default: {
            file.setFont('helvetica', 'normal')
            file.setFontSize(textSize)
        }
    }
}

export interface HeaderConfig {
    name: string
    phone: string,
    email: string
}

export interface SummaryConfig {
    description: string
}

export interface TopSkillsConfig {
    skills: string[]
}

export interface ExperienceConfig {
    exp: JobPosition []
}

export interface JobPosition {
    company: string,
    position: string,
    year_start: string,
    year_end: string,
    bullets: string []
}

export interface EducationConfig {
    school: string
    degree: string
    gpa: string
    grad_year: string
}

export interface ContentConfig {
    header: HeaderConfig
    summary: SummaryConfig
    top_skills: TopSkillsConfig
    experience: ExperienceConfig
    education: EducationConfig
}
