/**
 * Apply hand-crafted ultra-rigorous VP question kit (25 questions).
 * Run: node scripts/apply-vp-ultra-kit.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, "..", "data", "store.json");
const VP_ROLE_ID = 2;

const QUESTIONS = [
  {
    category: "scenario",
    question:
      "It's Monday 9am: our $8,500 title sponsor emails that they will pull funding in 72 hours unless we remove the OpenClaw agent module from summer curriculum because it 'promotes a competitor stack.' The President is in class until 4pm. The Head of AI says removing it guts the program. Marketing already scheduled a sponsor-logo post for Wednesday. Walk me through your first 6 hours — who you call, what you say to the sponsor (outline the email), what you tell the AI team, and what you postpone or cancel.",
    rubric:
      "MUST-HAVE:\n- Acknowledged the sponsor's email within 2 hours and proposed a specific next step (like a call or meeting).\n- Planned how to inform the President, assess the AI team's concerns, and pause the marketing post.\n- Listed at least 3 different messages for stakeholders (sponsor, AI team, marketing) with unique content.\n- Suggested negotiation ideas without removing the curriculum entirely.\n- Clearly stated the 72-hour deadline and checkpoints for decisions.\nSTRONG:\n- Provided a detailed plan for the first 6–24 hours with specific people responsible.\n- Drafted a sample email to the sponsor that acknowledges their concerns and requests a meeting without committing to removal.\nRED FLAGS:\n- Promised to remove the curriculum or keep funding without the President's approval.\n- Gave a vague response about communicating with everyone without specifics.",
  },
  {
    category: "scenario",
    question:
      "Fire Hacks finals: 118 participants, venue power fails 90 minutes before judging ends. Emergency lights only, two mentors report a student having a panic attack in the stairwell, and the venue manager says power may not return for 3+ hours. Sponsors are in the judging room. What is your command sequence in the first 30 minutes — safety, communications, judging integrity, and sponsor relations?",
    rubric:
      "MUST-HAVE:\n- Prioritized safety first, including helping the student in distress and considering medical assistance.\n- Made a decision on whether to evacuate or stay put based on venue guidance.\n- Created a communication plan for participants within 15 minutes (like using PA, Slack, or group text).\n- Ensured judging integrity by pausing and documenting scores with a backup plan.\n- Briefed sponsors within the first 10 minutes to keep them informed.\nSTRONG:\n- Provided a minute-by-minute plan for the first 30 minutes with specific people assigned to tasks.\n- Suggested contingency plans like relocating judging or rescheduling finals.\nRED FLAGS:\n- Put judging or sponsors before student safety.\n- Had no plan to ensure fair judging if the event was disrupted.",
  },
  {
    category: "judgment",
    question:
      "A parent emails the school board and CodeStarters claiming their daughter was repeatedly called 'not technical enough' by the AI literacy mentor in front of peers — and demands the mentor be removed by Friday. The mentor denies it; two students partially corroborate tone issues but not the exact words. The President says 'handle it.' What do you do before Friday, including what you say to the parent, mentor, and class?",
    rubric:
      "MUST-HAVE:\n- Treated the situation as a serious concern, not just a personality issue.\n- Gathered facts by interviewing the parent, students, and mentor before Friday.\n- Implemented interim measures for the student’s safety until the investigation is done.\n- Responded to the parent within 24 hours, acknowledging their concerns and outlining steps taken.\n- Planned for escalation if misconduct is confirmed (like mentor removal or retraining).\nSTRONG:\n- Outlined investigation steps with a neutral interviewer and kept written records.\n- Planned a private conversation with the mentor to discuss the issue without retaliation.\nRED FLAGS:\n- Removed the mentor without investigation or ignored the parent's concerns.",
  },
  {
    category: "leadership",
    question:
      "Mid-season Basic CS bootcamp: the lead mentor has missed 4 of 6 sessions without notice. Eight of twelve parents emailed demanding refunds or a new mentor. Replacement mentors are already at capacity. Session is tomorrow 4pm. What is your plan in the next 24 hours — including what students experience tomorrow and what you tell parents?",
    rubric:
      "MUST-HAVE:\n- Contacted the absent mentor today with a deadline to respond or be replaced.\n- Ensured tomorrow's session is covered with a plan for who teaches and what curriculum is used.\n- Communicated honestly with parents today about the situation and timeline for a fix.\n- Assessed whether the mentor should be removed or if this is a one-time issue.\n- Created a plan for students to catch up on missed sessions (like recordings or extra office hours).\nSTRONG:\n- Named a substitute mentor and ensured they have prep time before the session.\n- Drafted an email to parents acknowledging the situation and outlining the plan.\nRED FLAGS:\n- Cancelled the session without a replacement or made false promises about the mentor showing up.",
  },
  {
    category: "scenario",
    question:
      "A TikTok with 40k views claims CodeStarters students 'cheated' on a free Cupertino business website by using ChatGPT and the business owner is 'humiliated.' The owner tags us angry in the comments. Head of Marketing wants to post a funny meme response. President is unreachable for 6 hours. What do you do in the first 2 hours — public response, owner outreach, internal student protection, and marketing lockdown?",
    rubric:
      "MUST-HAVE:\n- Stopped or delayed the meme response, explaining why tone is important in a crisis.\n- Reached out to the business owner within 2 hours, outlining the conversation.\n- Conducted an internal fact check on the project and student compliance with AI policy.\n- Created a public holding statement or decided to pause public posts until facts are clear.\n- Ensured student protection by not revealing identities or blaming students publicly.\nSTRONG:\n- Provided a 2-hour timeline for actions like marketing lock and owner outreach.\n- Specified different messages for the TikTok audience, the owner, and students.\nRED FLAGS:\n- Posted a meme response or sarcastic reply to the accusation.\n- Ignored the business owner's concerns or let marketing handle it without oversight.",
  },
  {
    category: "judgment",
    question:
      "Cupertino Unified wants a partnership MOU signed today to promote bootcamps in schools. The President is at a conference with no phone access. The district liaison says if we don't sign by 5pm they move to another org. The MOU includes a clause letting the district review all curriculum materials and pause programs if parents complain. You have not read the full 12-page document. What do you do?",
    rubric:
      "MUST-HAVE:\n- Did NOT sign the MOU without the President's approval.\n- Requested an extension or a letter of intent instead of signing the full MOU.\n- Identified risky clauses in the MOU and flagged them for review.\n- Named who will read the document and set a timeline for proper approval.\n- Communicated with the district to maintain a good relationship without binding the organization.\nSTRONG:\n- Drafted a script for contacting the liaison, expressing enthusiasm while needing the President's signature.\n- Summarized the top risks from the MOU for the President's review.\nRED FLAGS:\n- Signed the MOU to meet the deadline without the President's consent.",
  },
  {
    category: "leadership",
    question:
      "Finals week: six of fourteen bootcamp mentors ghost their sessions — all cite exams. You have ~200 student seats across CS and AI tracks tomorrow and only eight mentors available. Three sessions are merged sections already at 22 students. How do you allocate mentors, what sessions get cancelled or converted, and how do you communicate to parents by 8pm tonight?",
    rubric:
      "MUST-HAVE:\n- Calculated the number of mentors and students to show class size tradeoffs.\n- Established prioritization rules for sessions based on student needs.\n- Communicated with parents by 8pm about session changes and access to materials.\n- Recruited emergency coverage from other mentors or planned for recorded sessions.\n- Informed the President and track heads before communicating with parents.\nSTRONG:\n- Created a detailed table for each session's status and format.\n- Ensured mentor reassignment was fair and did not overburden any single mentor.\nRED FLAGS:\n- Held unsafe sessions with too many students and no plan.\n- Canceled sessions without informing parents in advance.",
  },
  {
    category: "judgment",
    question:
      "A 7th grader reports that an AI mentor used screenshots of her chatbot project — including her name — in a public demo at a sponsor event without asking her or her parents. The mentor says it was 'educational promotion.' The sponsor posted photos on LinkedIn. Parents want the post deleted and mentor fired. President says mentor is 'essential.' Your move?",
    rubric:
      "MUST-HAVE:\n- Treated the situation as a serious violation of student consent.\n- Immediately requested the sponsor to remove or blur the student's identifiable content.\n- Planned a conversation with the parent and student to apologize and explain changes.\n- Held the mentor accountable with a documented conversation about the policy violation.\n- Enforced internal policies to prevent similar issues in the future.\nSTRONG:\n- Created a 24–48 hour plan for follow-up and updates to the parent.\n- Named awareness of consent policies for minors in nonprofit settings.\nRED FLAGS:\n- Supported the mentor publicly without addressing the student's concerns.",
  },
  {
    category: "scenario",
    question:
      "A Cupertino bakery owner says their free website is 3 weeks late; their grand reopening is in 5 days and they CC'd the city small-business liaison on the email threatening to tell the community we 'scammed them.' The student team lead ghosted. Head of AI says reassigning engineers will delay two other business sites. What do you do this week — owner, city liaison, student team, and other clients?",
    rubric:
      "MUST-HAVE:\n- Call the bakery owner today to apologize and give a clear delivery date before reopening, or explain if you can't meet it and suggest a temporary solution.\n- Respond to the city liaison professionally, sticking to the facts without blaming the owner.\n- Hold the student team lead accountable: document your contact, escalate to the Head of AI, and assign a replacement developer.\n- Decide what can be delivered in 5 days (like hours, menu, contact info) versus what will be delayed on other sites.\nSTRONG:\n- Create a day-by-day plan with a senior student or mentor overseeing and set checkpoints.\n- Communicate with other business clients about any timeline changes to keep them informed.\nRED FLAGS:\n- Blame the owner or say 'free work' in any written communication.\n- Promise a full site in 5 days without a plan for resources.\n- Ignore the city liaison's email or respond aggressively.\n- Launch a broken site on reopening day.",
  },
  {
    category: "scenario",
    question:
      "Fire Hacks: the winning team alleges the judge — who works for a title sponsor — ranked their competitor first because both teams used the sponsor's API and the judge coached the competitor privately. 200 people are still in the room. The sponsor judge denies it. The competitor team says they'll leave if results are overturned. How do you resolve this in the next 60 minutes without destroying the event or sponsor relationship?",
    rubric:
      "MUST-HAVE:\n- Pause the announcement of results and acknowledge the concern without attacking anyone.\n- Apply conflict-of-interest rules: the sponsor judge should step back from reviewing the disputed category.\n- Set up an independent review process with other judges and a 60-minute deadline.\n- Inform both teams about the review process to ensure fairness and transparency.\nSTRONG:\n- Secure scoring sheets and explain the re-scoring rubric to the teams.\n- If results are overturned, prepare a graceful announcement; if not, explain the findings to the alleging team privately.\nRED FLAGS:\n- Announce the original results to avoid upsetting the sponsor.\n- Publicly accuse the judge of wrongdoing without a review.\n- Allow the competitor team to leave without trying to mediate.\n- Let the same judge re-judge their own scores.",
  },
  {
    category: "judgment",
    question:
      "The board treasurer says we must cut 30% from spring programs immediately. You must choose ONE primary sacrifice: (A) cut 40% of summer bootcamp seats, (B) cancel Fire Hacks prize pool and halve event scale, or (C) drop three committed free business websites. President wants all three programs untouched. There is no hidden fourth budget. How do you decide, and how do you tell each program lead and the board?",
    rubric:
      "MUST-HAVE:\n- Clearly choose one option (A, B, or C) with a reason that aligns with our mission — you must choose.\n- Analyze how each option affects stakeholders (students, sponsors, businesses, reputation).\n- State your criteria for the decision: reversibility, number of people affected, donor commitments, legal obligations.\n- Plan how to communicate the decision to program leads, the board, and the public — do this before any leaks.\nSTRONG:\n- Provide numbers on how many students/businesses/dollars are affected by each option.\n- Suggest ways to lessen the impact of the chosen sacrifice (like partial prizes or a smaller bootcamp).\nRED FLAGS:\n- Say 'we will find a way to do everything' without making trade-offs.\n- Choose without explaining why or blame the treasurer/board.\n- Inform the public before telling internal leads or throw program leads under the bus in board emails.\n- Ignore commitments to business owners or sponsors.",
  },
  {
    category: "scenario",
    question:
      "A Mercury News reporter emails: 'Parents say your AI bootcamp lets minors run autonomous agents with internet access unsupervised. What's your supervision policy?' Deadline 4pm today for quote. Your actual supervision varies by mentor and room layout. President wants to 'sound innovative.' What quote do you propose, what do you fix operationally before responding, and who signs off?",
    rubric:
      "MUST-HAVE:\n- Do not claim perfect supervision if it's not true — avoid making false statements.\n- Conduct a same-day operational audit: check agent access rules, mentor ratios, and internet policies — name quick fixes.\n- Draft a quote that balances innovation with child safety specifics (like ratios and adult review steps).\n- Get the President's approval before sending the response; ensure the VP doesn't use unsafe language.\nSTRONG:\n- Propose actual quote language (2-4 sentences) with clear policy points.\n- Make immediate changes to sessions, like disabling unsupervised agent deployment — name who will enforce this today.\nRED FLAGS:\n- Say 'full autonomy is fine' or dismiss parent concerns in the quote.\n- Respond after the deadline without coordination or ignore the reporter.\n- Let the President quote without a safety review.\n- Make no operational changes, only focus on PR.",
  },
  {
    category: "judgment",
    question:
      "At a sponsor reception, a sponsor's VP (who funds $5k) is visibly drunk, puts an arm around your Head of Marketing, and asks her to 'come back to the hotel to discuss renewal.' She texts you terrified in the bathroom. President is networking across the room and told you to 'keep sponsors happy.' What do you do in the next 15 minutes and the next 48 hours?",
    rubric:
      "MUST-HAVE:\n- Ensure the Head of Marketing's safety by removing her from the situation and not leaving her alone with the sponsor VP.\n- Set a clear boundary with the sponsor VP tonight — specify what is said and who says it (no hotel, unacceptable behavior).\n- Support the Head of Marketing — do not tell her to tolerate the situation for funding.\n- Inform the President tonight with the facts, not hiding anything.\n- Document the incident: time, witnesses, and texts should be preserved.\nSTRONG:\n- Create a 48-hour plan: send a formal email to the sponsor's account manager requesting a different representative and pause renewal discussions until the issue is resolved.\n- Involve internal harassment policy or adult advisors if applicable.\n- Let the Head of Marketing decide whether to report to school or parents if minors were present.\nRED FLAGS:\n- Tell the marketing lead to 'smooth it over' for renewal.\n- Leave her alone with the sponsor VP.\n- Ignore the incident to protect the $5k.\n- Publicly joke about the incident or share her text without her consent.",
  },
  {
    category: "leadership",
    question:
      "The President posts on Instagram: 'CodeStarters bootcamps are only for the most gifted kids — we don't have time for beginners.' Applications for beginner Basic CS are open; 60 applicants in 48 hours. Head of Marketing panics. President refuses to delete post ('it's our brand'). How do you fix operations and communications without a public war with the President?",
    rubric:
      "MUST-HAVE:\n- Clarify that beginner tracks exist — align our programming with the public message gap.\n- Communicate with applicants within 24 hours: welcome beginners and explain the actual tracks — draft key messages.\n- Have a private conversation with the President to clarify or suggest a follow-up post, avoiding a public confrontation.\n- Pause conflicting ads until the messaging is aligned.\n- Sync with internal leadership so mentors don't discourage beginners based on the post.\nSTRONG:\n- Propose a follow-up post or story from the President or the official CodeStarters account to clarify beginner paths — outline the text.\n- Prepare an email template for applicants addressing the confusion for the 60 applicants.\n- Brief mentors on inclusion standards for beginner sessions this week.\nRED FLAGS:\n- Publicly contradict the President in Instagram comments.\n- Ignore the 60 applicants or tell beginners they're not welcome.\n- Delete the President's post without authority or force marketing to meme it.\n- Make no operational fixes, only hope the post is ignored.",
  },
  {
    category: "scenario",
    question:
      "AI Development signups jumped from 45 to 142 in one week after a viral reel. Mentors report 18+ hours/week and two say they're quitting next Friday. Head of AI wants to accept everyone. President wants growth headlines. How do you set a sustainable cap, handle the 97 waitlisted families, and prevent mentor collapse — with numbers?",
    rubric:
      "MUST-HAVE:\n- Use a capacity formula: mentors × hours ÷ students per section = max seats — show the math with example numbers.\n- Decide on a hard cap with the President and Head of AI — do not allow unlimited growth.\n- Communicate with the waitlist: provide an honest timeline, avoiding 'everyone gets in eventually' without capacity.\n- Provide immediate relief for mentors: reduce their load, hire alumni, merge sections, or offer stipends — choose at least one.\n- Address the two quitting mentors: have a retention conversation this week with a concrete plan for reducing their load.\nSTRONG:\n- Offer 45 confirmed spots plus a structured waitlist of 97 with rolling admission dates.\n- Set a target for mentor hours capped per week (e.g., max 10) and explain how to achieve this.\n- Suggest a growth headline alternative for the President that doesn't promise unlimited seats.\nRED FLAGS:\n- Accept all 142 with the same number of mentors.\n- Ignore the waitlisted families.\n- Let the two mentors quit without a plan to redistribute their responsibilities.\n- Focus on growth for PR without discussing quality or burnout.",
  },
  {
    category: "judgment",
    question:
      "A volunteer posted the full spring student roster — names, schools, emails, parent phones — on a public Notion page linked in a mentor onboarding doc. A parent found it via Google. It's been public for 11 days. President says 'just delete the link.' What is your incident response in the first 48 hours?",
    rubric:
      "MUST-HAVE:\n- Immediately remove public access and audit Notion/workspace for other exposed documents — don't just delete one link.\n- Notify parents about what happened, what data was exposed, and what steps are being taken — do this within 48 hours.\n- Assess the scope: how many students were affected, what information was exposed, and if there’s evidence of misuse.\n- Hold the volunteer accountable: revoke their access, document the conversation, and change their role if needed.\n- Explain to the President why just deleting the link is not enough — a broader response is required.\nSTRONG:\n- Draft a notification letter to parents; offer credit monitoring only if appropriate — don’t overpromise.\n- Fix access controls: create a permissions model to prevent public student information on shared documents — name who will oversee this.\n- Keep an incident log for the board; consider notifying the school district if required by policy.\nRED FLAGS:\n- Only delete the link without notifying parents.\n- Hide the incident from the board or parents to avoid embarrassment.\n- Blame the parent who found the information.\n- Skip the access audit and leave other rosters public.",
  },
  {
    category: "scenario",
    question:
      "Black Friday for CodeStarters — all before noon: (1) parent claims a mentor left a 4th grader alone in lab for 20 minutes, (2) title sponsor emails they saw the complaint on parent Facebook and 're-evaluating partnership,' (3) your Fire Hacks registration site is down with 300 people trying to register, (4) Head of CS quits via Slack citing burnout. President is proctoring an AP test and can't respond until 1pm. What do you tackle first, second, third, fourth — and what do you delegate?",
    rubric:
      "MUST-HAVE:\n- Prioritize issues with a focus on safety first — the claim of a child being left alone must be the top priority.\n- Assign an owner and first action for each of the four crises within 1 hour.\n- Hold off on responding to the sponsor email until after noon, ensuring the Facebook complaint is addressed.\n- Create a workaround for the registration issue: manual form, backup link, or communication to the 300 users — be specific.\n- Plan for interim coverage for the Head of CS so sessions this week aren’t left without support.\nSTRONG:\n- Create a timeline from 9am to 1pm while the President is unavailable: clarify what decisions the VP can make and what needs to wait for the President.\n- Outline steps for investigating the lab incident and pause the mentor involved pending the facts.\n- Offer to call the sponsor today; don’t leave the Facebook narrative unaddressed for 6 hours.\nRED FLAGS:\n- Fix the registration issue first because it's 'easiest' while ignoring child safety.\n- Ignore the sponsor or let their email sit until the President is available.\n- Fail to plan for interim Head of CS coverage, leaving programs unsupported.\n- Try to handle everything alone without delegating tasks.",
  },
  {
    category: "scenario",
    question:
      "The President posts on Cupertino Library's event page that CodeStarters will run live OpenClaw agent demos at their grand reopening tomorrow — 200 expected attendees, local press invited. You have zero mentors confirmed, the library requires a liability insurance certificate you don't have on file, and Head of AI says safe demos need two weeks of prep. President says 'we can't embarrass ourselves by backing out.' What do you do in the next 18 hours?",
    rubric:
      "MUST-HAVE:\n- Do not commit to live agent demos tomorrow without safety and insurance clearance — specify what needs to be true to proceed.\n- Contact the library liaison today: ask about the insurance certificate timeline, capacity, and demo restrictions.\n- Assess with the Head of AI: decide on a minimum viable demo versus an unsafe shortcut — suggest a specific alternative (like slides or a recorded demo).\n- Have a private conversation with the President to align on a realistic scope before making any public corrections — avoid a public fight.\n- Create a plan for mentor coverage: who will run the booth, how many adults are needed, and a backup plan if demos are scaled down.\nSTRONG:\n- Create an hour-by-hour plan for the next 18 hours: rush the insurance, confirm mentors, get library sign-off, and set press expectations.\n- Prepare a public event page correction or comment from CodeStarters clarifying the actual offering if the President's post can't be edited.\n- Have a contingency plan if the library pulls the slot: consider an alternate community venue or a virtual stream with library partnership mention.\nRED FLAGS:\n- Show up tomorrow with unprepared live agents to avoid embarrassment.\n- Back out without communicating with the library or ghost the event page.\n- Publicly contradict the President regarding library comments.\n- Ignore the insurance requirement or the risk to the press.",
  },
  {
    category: "leadership",
    question:
      "Your most reliable Basic CS mentor posts in the private mentor Discord: 'I'm done being yelled at by the President in front of students.' Eight mentors react agreeing they're burnt out; two already cancelled next week's sessions. President says 'ignore the Discord drama — they're volunteers.' Head of CS is silent. What is your plan in the next 72 hours to stabilize staffing without a public org meltdown?",
    rubric:
      "MUST-HAVE:\n- Recognizes this as a staffing crisis, not just 'Discord drama' — acknowledges mentor burnout and President's behavior.\n- Reaches out privately to the mentor who posted and the two who canceled within 24 hours — has clear goals for these conversations.\n- Talks to the President: shares mentor concerns, asks for a change in behavior, rather than just telling them to ignore it.\n- Plans for next week's sessions: identifies substitutes or merges sections for canceled sessions.\nSTRONG:\n- Creates a 72-hour plan: includes mentor listening sessions, reducing workloads, and setting communication boundaries with the President.\n- Documents mentor complaints without sharing personal info publicly; keeps a record of the Discord thread if allowed.\nRED FLAGS:\n- Tells mentors to be grateful for volunteering and to stop complaining.\n- Shares the Discord thread with the President to 'prove they're dramatic' without permission.",
  },
  {
    category: "judgment",
    question:
      "The treasurer flags that a CS mentor ran ~$400 in OpenAI API usage through the nonprofit's shared org account for a personal freelance chatbot — not curriculum testing. The mentor admits it but says they'll 'pay back eventually.' President texts: 'Just absorb it — we can't lose them before finals week.' What do you do in the next 48 hours?",
    rubric:
      "MUST-HAVE:\n- Treats this as misuse of nonprofit resources, clearly stating it violates policy.\n- Immediately revokes access to the shared API account and checks other mentor usage.\n- Demands a clear repayment timeline from the mentor, not just a vague promise to pay back.\n- Aligns with the President on whether to absorb the cost or enforce repayment — provides a recommendation.\nSTRONG:\n- Develops a 48-hour plan: outlines repayment agreement or payroll deduction if the mentor is paid; considers suspending access until repayment.\n- Evaluates if the board or adult advisor needs to be notified based on the situation.\nRED FLAGS:\n- Agrees to absorb the $400 without a repayment plan just because the President said so.\n- Publicly shames the mentor in a group chat before having a private conversation.",
  },
  {
    category: "scenario",
    question:
      "A Cupertino parent influencer (52k followers) live-streams on Instagram outside your Saturday AI bootcamp, telling viewers CodeStarters 'exploits student volunteers to build free business websites that never ship.' Fifteen parents are in the parking lot watching; session is ongoing inside with 28 students. President is inside teaching and hasn't seen it. What do you do in the first 30 minutes?",
    rubric:
      "MUST-HAVE:\n- Does not confront the influencer aggressively on camera — maintains a calm and factual tone.\n- Ensures minimal disruption to the student session inside; has adults monitor students without involving them in the parking lot drama.\n- Quickly fact-checks the claims made by the influencer — gets the Head of AI or operations to pull delivery status within 30 minutes.\n- Responds briefly to parents in the parking lot or invites them to talk privately — has a clear message plan.\nSTRONG:\n- Creates a 30-minute plan: assigns who will handle the influencer, who will watch the students, who will inform the President, and who will draft a follow-up post.\n- If any claims are true, acknowledges them honestly and provides examples of what has been delivered without attacking the influencer.\nRED FLAGS:\n- Brings students outside to defend the organization on live stream.\n- Denies all claims without checking project records.",
  },
  {
    category: "leadership",
    question:
      "Head of CS and Head of AI both demand the only org-wide Saturday 10am–12pm slot for mandatory mentor training — CS wants de-escalation and classroom management, AI wants agent safety and Hermes/OpenCode certification. President says 'pick one and tell the other they're wrong.' Neither will budge. 22 mentors must attend one or both. What do you decide and how do you tell each head and the mentors?",
    rubric:
      "MUST-HAVE:\n- Makes a decision: splits the training slot, sequences it over two weeks, or chooses a hybrid format — avoids indefinite delays.\n- Ties the decision to the urgency of safety certification versus classroom management — explains the reasoning.\n- Talks to both heads before announcing to mentors — shows respect without publicly calling one 'wrong.'\n- Updates the mentor calendar with clear attendance expectations and options for recording or attending asynchronously.\nSTRONG:\n- Provides a concrete schedule: e.g., 10–11 for CS, 11–12 for AI, or a rotation with specific dates.\n- Creates a combined training module that both heads agree on (e.g., a shared focus on student safety).\nRED FLAGS:\n- Publicly tells the Head of AI they are wrong just to please the President.\n- Cancels both trainings indefinitely.",
  },
  {
    category: "judgment",
    question:
      "A title sponsor offers $12,000 if CodeStarters publicly endorses their new AI homework app to middle schoolers in a joint Instagram Live next Tuesday. Head of Marketing drafted the post and scheduled the Live. You haven't reviewed the app's data policy; the nonprofit's adult legal advisor is unreachable until Monday. President says 'we need the money now.' What do you do before Tuesday?",
    rubric:
      "MUST-HAVE:\n- Does NOT go live endorsing the product without a proper review — states what needs to be reviewed first.\n- Communicates with the sponsor: expresses enthusiasm but explains the need to delay the endorsement until the policy is reviewed.\n- Holds off on the scheduled Live and draft post until everything is cleared.\n- Conducts an interim product review: the VP and Head of AI check for data retention, age restrictions, and other concerns — names the checklist items.\nSTRONG:\n- Outlines a timeline: what happens from Friday to Tuesday if the advisor is still unavailable (e.g., postponing the Live, sending a letter of intent).\n- Clarifies the scope of endorsement: distinguishes between event sponsorship and product recommendations to minors.\nRED FLAGS:\n- Goes live just because the President needs the money.\n- Ignores the sponsor instead of negotiating a delay.",
  },
  {
    category: "judgment",
    question:
      "Three Basic CS mentors report privately that an Advanced CS mentor regularly humiliates freshmen in the hallway after class — freshmen won't give names to the President because they're friends with the alleged mentor. Beginner Basic CS applications open in 3 days; parents ask about 'safe environment.' President says 'no proof, don't rock the boat before recruitment.' What do you do this week?",
    rubric:
      "MUST-HAVE:\n- Treats the reports as serious even without named freshmen — does not dismiss them for lack of 'proof.'\n- Implements interim measures: ensures the alleged mentor is supervised and has no solo contact with beginners.\n- Conducts neutral fact-finding: the VP or Head of CS interviews Basic CS mentors and considers an anonymous reporting option.\n- Communicates honestly with parents about safety concerns — drafts key messages.\nSTRONG:\n- Creates a week plan before applications open: outlines investigation steps and what changes if the allegations are proven true.\n- Ensures Basic CS mentors feel safe reporting without fear of retaliation.\nRED FLAGS:\n- Waits for freshmen to name names before taking any action.\n- Tells Basic CS mentors they are exaggerating to protect the President's friend.",
  },
  {
    category: "scenario",
    question:
      "Fire Hacks venue cancels 48 hours before the event — flood damage, no access until next month. You have 95 registered hackers, $8k in sponsor booth fees collected, caterer confirmed, and three title sponsors flying in. President insists the original Saturday date must hold 'because momentum.' Alternate venues: one holds 40 max, another costs $15k (budget has $4k left). What is your plan in the next 48 hours?",
    rubric:
      "MUST-HAVE:\n- Does NOT pretend the original venue will work — communicates honestly with stakeholders within 24 hours.\n- Analyzes options with clear numbers: considers the 40-cap venue, the question:
      "Fire Hacks venue cancels 48 hours before the event — flood damage, no access until next month. You have 95 registered hackers, $8k in sponsor booth fees collected, caterer confirmed, and three title sponsors flying in. President insists the original Saturday date must hold 'because momentum.' Alternate venues: one holds 40 max, another costs $15k (budget has $4k left). What is your plan in the next 48 hours?",
    rubric:
      "5k venue, hybrid/virtual options, or postponing — picks a path with a rationale.\n- Prepares a script for sponsors: explains the venue loss and proposes adjustments for booth deliverables.\n- Communicates with the caterer and registration: cancels or renegotiates, and informs hackers of new logistics.\nSTRONG:\n- Develops a 48-hour execution timeline: includes venue contracts, sponsor booth mapping, and virtual options for overflow hackers.\n- Creates a financial plan to cover the question:
      "Fire Hacks venue cancels 48 hours before the event — flood damage, no access until next month. You have 95 registered hackers, $8k in sponsor booth fees collected, caterer confirmed, and three title sponsors flying in. President insists the original Saturday date must hold 'because momentum.' Alternate venues: one holds 40 max, another costs $15k (budget has $4k left). What is your plan in the next 48 hours?",
    rubric:
      "5k gap — considers emergency board approval or scaling down the event.\nRED FLAGS:\n- Holds the event at a flooded venue or an unpermitted space.\n- Ignores the 95 hackers until the morning of the event.",
  },
];

const store = JSON.parse(readFileSync(storePath, "utf8"));
const oldCount = store.questions.filter((q) => q.role_id === VP_ROLE_ID).length;

store.questions = store.questions.filter((q) => q.role_id !== VP_ROLE_ID);
const now = new Date().toISOString();

for (let i = 0; i < QUESTIONS.length; i++) {
  const q = QUESTIONS[i];
  store.questions.push({
    id: store.nextId.questions++,
    role_id: VP_ROLE_ID,
    question: q.question,
    category: q.category,
    rubric: q.rubric,
    sort_order: i,
    created_at: now,
  });
}

writeFileSync(storePath, JSON.stringify(store, null, 2));
const newCount = store.questions.filter((q) => q.role_id === VP_ROLE_ID).length;
console.log(`Applied ultra VP kit: ${newCount} questions (replaced ${oldCount}).`);
