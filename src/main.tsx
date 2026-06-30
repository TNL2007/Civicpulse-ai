import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Cloud,
  Download,
  Filter,
  Gauge,
  ImagePlus,
  Layers3,
  Lightbulb,
  LocateFixed,
  MessageSquareText,
  Navigation,
  Radio,
  RefreshCcw,
  Route,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import "./styles.css";

type Category = "Road Damage" | "Streetlight" | "Waste" | "Water Leak" | "Drainage";
type Status = "Reported" | "Verified" | "In Progress" | "Resolved";
type Team = "Roads and Safety" | "Sanitation" | "Water Board" | "Electrical" | "Drainage";
type ActivityType = "AI" | "Citizen" | "Authority" | "System";

type Issue = {
  id: number;
  title: string;
  category: Category;
  location: string;
  status: Status;
  severity: number;
  reports: number;
  verifiedBy: number;
  ageHours: number;
  x: number;
  y: number;
  summary: string;
  action: string;
  ward: string;
  team: Team;
  confidence: number;
  duplicateRisk: number;
  sla: string;
  evidence: string;
  assignee: string;
  lastUpdate: string;
  costEstimate: string;
  nextStep: string;
  publicMessage: string;
};

type Activity = {
  id: number;
  type: ActivityType;
  message: string;
  time: string;
};

const categoryMeta: Record<Category, { color: string; short: string }> = {
  "Road Damage": { color: "#e85d4f", short: "RD" },
  Streetlight: { color: "#f0b429", short: "SL" },
  Waste: { color: "#2f9e79", short: "WA" },
  "Water Leak": { color: "#2887d9", short: "WL" },
  Drainage: { color: "#7c63d9", short: "DR" },
};

const seededIssues: Issue[] = [
  {
    id: 1042,
    title: "Deep pothole near school gate",
    category: "Road Damage",
    location: "Anna Nagar 3rd Main",
    status: "Verified",
    severity: 92,
    reports: 24,
    verifiedBy: 16,
    ageHours: 7,
    x: 32,
    y: 36,
    summary: "Large road cavity blocking two-wheeler lane during school pickup hours.",
    action: "Route to roads team with same-day barricade request.",
    ward: "Ward 12",
    team: "Roads and Safety",
    confidence: 96,
    duplicateRisk: 18,
    sla: "6 hours",
    evidence: "Image shows exposed broken asphalt, water pooling, and school-zone traffic.",
    assignee: "Ravi Kumar",
    lastUpdate: "12 min ago",
    costEstimate: "Rs. 18,000",
    nextStep: "Dispatch patch crew and place temporary warning cones.",
    publicMessage: "Roads team has verified the issue and repair is being scheduled.",
  },
  {
    id: 1039,
    title: "Overflowing waste point",
    category: "Waste",
    location: "Market Street Junction",
    status: "In Progress",
    severity: 78,
    reports: 18,
    verifiedBy: 11,
    ageHours: 11,
    x: 61,
    y: 29,
    summary: "Garbage pile spilling onto sidewalk, high foot traffic nearby.",
    action: "Assign sanitation vehicle and mark repeat-offender zone.",
    ward: "Ward 08",
    team: "Sanitation",
    confidence: 94,
    duplicateRisk: 32,
    sla: "12 hours",
    evidence: "Multiple reports from same market block confirm recurring waste overflow.",
    assignee: "Meena S",
    lastUpdate: "24 min ago",
    costEstimate: "Rs. 4,500",
    nextStep: "Send compact collection vehicle and inspect illegal dumping source.",
    publicMessage: "Sanitation vehicle assigned. Cleanup status will be updated after pickup.",
  },
  {
    id: 1035,
    title: "Streetlight out for 3 nights",
    category: "Streetlight",
    location: "Lake View Road",
    status: "Reported",
    severity: 64,
    reports: 9,
    verifiedBy: 4,
    ageHours: 29,
    x: 72,
    y: 66,
    summary: "Dark stretch affecting evening pedestrians near bus stop.",
    action: "Request electrical inspection and bulb replacement.",
    ward: "Ward 04",
    team: "Electrical",
    confidence: 88,
    duplicateRisk: 21,
    sla: "24 hours",
    evidence: "Citizen notes mention three consecutive nights and a nearby transit stop.",
    assignee: "Arun P",
    lastUpdate: "1 hr ago",
    costEstimate: "Rs. 2,200",
    nextStep: "Check feeder line, replace bulb, and confirm after sunset.",
    publicMessage: "Electrical team has received the report and will inspect tonight.",
  },
  {
    id: 1028,
    title: "Water leakage from main line",
    category: "Water Leak",
    location: "Temple Cross Street",
    status: "Verified",
    severity: 86,
    reports: 21,
    verifiedBy: 14,
    ageHours: 15,
    x: 43,
    y: 72,
    summary: "Continuous leak causing standing water and road erosion.",
    action: "Escalate to water board with valve isolation priority.",
    ward: "Ward 15",
    team: "Water Board",
    confidence: 93,
    duplicateRisk: 15,
    sla: "4 hours",
    evidence: "Standing water pattern and repeated reports indicate active main-line leakage.",
    assignee: "Nisha R",
    lastUpdate: "18 min ago",
    costEstimate: "Rs. 26,000",
    nextStep: "Isolate valve, dispatch leak crew, and protect affected road edge.",
    publicMessage: "Water board team is prioritizing this leak due to safety risk.",
  },
  {
    id: 1017,
    title: "Blocked storm drain",
    category: "Drainage",
    location: "Metro Feeder Road",
    status: "Resolved",
    severity: 52,
    reports: 12,
    verifiedBy: 8,
    ageHours: 43,
    x: 21,
    y: 63,
    summary: "Drain cleared after community reports and ward crew visit.",
    action: "Monitor in next rainfall cycle.",
    ward: "Ward 02",
    team: "Drainage",
    confidence: 89,
    duplicateRisk: 9,
    sla: "Resolved",
    evidence: "Before/after status confirms crew intervention and citizen closure feedback.",
    assignee: "Ward Crew 2",
    lastUpdate: "Yesterday",
    costEstimate: "Rs. 6,000",
    nextStep: "Keep issue closed and monitor same drain during next rainfall.",
    publicMessage: "Drain cleared. Residents can reopen if flooding returns.",
  },
];

const initialActivities: Activity[] = [
  { id: 1, type: "AI", message: "Gemini ranked Anna Nagar pothole as highest risk because it is near a school.", time: "Now" },
  { id: 2, type: "Authority", message: "Water Board received a 4-hour SLA alert for Temple Cross Street.", time: "18 min ago" },
  { id: 3, type: "Citizen", message: "16 residents verified the school-gate road damage report.", time: "42 min ago" },
  { id: 4, type: "System", message: "One resolved drainage issue is being monitored for rainfall recurrence.", time: "Yesterday" },
];

function classifyDraft(
  text: string,
): Pick<
  Issue,
  | "category"
  | "severity"
  | "summary"
  | "action"
  | "team"
  | "confidence"
  | "duplicateRisk"
  | "sla"
  | "evidence"
  | "assignee"
  | "costEstimate"
  | "nextStep"
  | "publicMessage"
> {
  const normalized = text.toLowerCase();
  if (normalized.includes("light")) {
    return {
      category: "Streetlight",
      severity: 67,
      summary: "Likely lighting failure with pedestrian safety risk after sunset.",
      action: "Send to electrical maintenance and ask citizens for night confirmation.",
      team: "Electrical",
      confidence: 87,
      duplicateRisk: 24,
      sla: "24 hours",
      evidence: "Gemini would inspect night image/video cues and nearby pedestrian context.",
      assignee: "Auto-router",
      costEstimate: "Rs. 2,000",
      nextStep: "Create electrical inspection ticket and ask nearby residents for night confirmation.",
      publicMessage: "Electrical team will inspect the light and confirm status after sunset.",
    };
  }
  if (normalized.includes("garbage") || normalized.includes("waste") || normalized.includes("trash")) {
    return {
      category: "Waste",
      severity: 74,
      summary: "Waste accumulation detected, possible hygiene and access issue.",
      action: "Queue sanitation pickup and check for repeated dumping pattern.",
      team: "Sanitation",
      confidence: 92,
      duplicateRisk: 31,
      sla: "12 hours",
      evidence: "Visual pile size, walkway blockage, and repeated location reports raise priority.",
      assignee: "Auto-router",
      costEstimate: "Rs. 4,000",
      nextStep: "Queue sanitation pickup and check whether this is a repeated dumping point.",
      publicMessage: "Sanitation pickup has been queued for this location.",
    };
  }
  if (normalized.includes("water") || normalized.includes("leak")) {
    return {
      category: "Water Leak",
      severity: 84,
      summary: "Possible water-line leak requiring quick utility response.",
      action: "Escalate to water department with leakage severity tag.",
      team: "Water Board",
      confidence: 91,
      duplicateRisk: 17,
      sla: "4 hours",
      evidence: "Water spread, road wetness, and user description suggest active leakage.",
      assignee: "Auto-router",
      costEstimate: "Rs. 24,000",
      nextStep: "Escalate to water board and request valve isolation.",
      publicMessage: "Water board has been alerted because this may affect road safety.",
    };
  }
  if (normalized.includes("drain")) {
    return {
      category: "Drainage",
      severity: 76,
      summary: "Drainage obstruction could worsen during rainfall.",
      action: "Assign ward crew and flag nearby flood-prone roads.",
      team: "Drainage",
      confidence: 89,
      duplicateRisk: 22,
      sla: "8 hours",
      evidence: "Blocked drain keywords and street-level evidence trigger flood-risk routing.",
      assignee: "Auto-router",
      costEstimate: "Rs. 7,000",
      nextStep: "Assign ward crew and flag surrounding streets for flood risk.",
      publicMessage: "Drainage crew will inspect this location before rainfall risk increases.",
    };
  }
  return {
    category: "Road Damage",
    severity: 88,
    summary: "Road damage likely to affect two-wheelers and emergency access.",
    action: "Route to road repair team with safety barricade recommendation.",
    team: "Roads and Safety",
    confidence: 95,
    duplicateRisk: 19,
    sla: "6 hours",
    evidence: "Gemini would detect broken road surface, cavity size, and traffic exposure.",
    assignee: "Auto-router",
    costEstimate: "Rs. 18,000",
    nextStep: "Create roads work order and recommend barricading the hazard.",
    publicMessage: "Roads team has received this safety issue for repair planning.",
  };
}

function nextStatus(status: Status): Status {
  if (status === "Reported") return "Verified";
  if (status === "Verified") return "In Progress";
  if (status === "In Progress") return "Resolved";
  return "Resolved";
}

function App() {
  const [issues, setIssues] = useState<Issue[]>(seededIssues);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [teamFilter, setTeamFilter] = useState<"All" | Team>("All");
  const [view, setView] = useState<"Citizen" | "Authority" | "Analytics">("Citizen");
  const [draft, setDraft] = useState({
    title: "Pothole near bus stop",
    location: "Gandhi Road Signal",
    details: "Large pothole filled with water near a busy bus stop",
  });
  const [fileName, setFileName] = useState("street-image.jpg");
  const [selectedId, setSelectedId] = useState(seededIssues[0].id);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [toast, setToast] = useState("Ready: click any action to simulate the civic workflow.");
  const reportRef = useRef<HTMLElement | null>(null);
  const queueRef = useRef<HTMLElement | null>(null);

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      const matchesCategory = category === "All" || issue.category === category;
      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesTeam = teamFilter === "All" || issue.team === teamFilter;
      const matchesQuery = `${issue.title} ${issue.location} ${issue.category} ${issue.team} ${issue.ward}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesStatus && matchesTeam && matchesQuery;
    });
  }, [issues, category, query, statusFilter, teamFilter]);

  const selected = issues.find((issue) => issue.id === selectedId) ?? issues[0];
  const openCount = issues.filter((issue) => issue.status !== "Resolved").length;
  const verifiedCount = issues.filter((issue) => issue.status === "Verified" || issue.status === "In Progress").length;
  const resolvedCount = issues.filter((issue) => issue.status === "Resolved").length;
  const topPriority = [...issues].sort((a, b) => b.severity + b.reports - (a.severity + a.reports))[0];
  const ai = classifyDraft(`${draft.title} ${draft.details}`);

  function addActivity(type: ActivityType, message: string) {
    setActivities((current) => [{ id: Date.now(), type, message, time: "Just now" }, ...current].slice(0, 8));
    setToast(message);
  }

  function submitReport() {
    const newIssue: Issue = {
      id: Math.max(...issues.map((issue) => issue.id)) + 1,
      title: draft.title || "New civic issue",
      location: draft.location || "Current location",
      status: "Reported",
      reports: 1,
      verifiedBy: 0,
      ageHours: 0,
      lastUpdate: "Just now",
      ward: `Ward ${Math.floor(3 + Math.random() * 14).toString().padStart(2, "0")}`,
      x: 52 + Math.round(Math.random() * 28 - 14),
      y: 48 + Math.round(Math.random() * 28 - 14),
      ...ai,
    };
    setIssues([newIssue, ...issues]);
    setSelectedId(newIssue.id);
    setStatusFilter("All");
    setTeamFilter("All");
    addActivity("AI", `Gemini classified "${newIssue.title}" as ${newIssue.category} and routed it to ${newIssue.team}.`);
  }

  function verifyIssue(id: number) {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              reports: issue.reports + 1,
              verifiedBy: issue.verifiedBy + 1,
              status: issue.status === "Reported" ? "Verified" : issue.status,
              severity: Math.min(99, issue.severity + 2),
              lastUpdate: "Just now",
            }
          : issue,
      ),
    );
    const target = issues.find((issue) => issue.id === id);
    if (target) addActivity("Citizen", `Community verification added for #${id}: ${target.title}.`);
  }

  function advanceIssue(id: number) {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: nextStatus(issue.status),
              lastUpdate: "Just now",
              publicMessage:
                nextStatus(issue.status) === "Resolved"
                  ? "Issue marked resolved. Community can reopen if the problem returns."
                  : issue.publicMessage,
            }
          : issue,
      ),
    );
    const target = issues.find((issue) => issue.id === id);
    if (target) addActivity("Authority", `Status advanced for #${id} from ${target.status} to ${nextStatus(target.status)}.`);
  }

  function assignRoute(id: number) {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: issue.status === "Reported" ? "Verified" : issue.status,
              assignee: issue.assignee === "Auto-router" ? `${issue.team} lead` : issue.assignee,
              lastUpdate: "Just now",
            }
          : issue,
      ),
    );
    addActivity("Authority", `Work order routed for #${id} to ${selected.team} with SLA ${selected.sla}.`);
  }

  function notifyCitizens(id: number) {
    addActivity("System", `Public update sent for #${id}: ${selected.publicMessage}`);
  }

  function markDuplicate(id: number) {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              reports: issue.reports + 3,
              verifiedBy: issue.verifiedBy + 2,
              duplicateRisk: Math.min(99, issue.duplicateRisk + 18),
              severity: Math.min(99, issue.severity + 1),
              lastUpdate: "Just now",
            }
          : issue,
      ),
    );
    addActivity("AI", `Duplicate scan linked nearby citizen reports to #${id} and raised its validation count.`);
  }

  async function exportBriefing() {
    const briefing = `CivicPulse AI Briefing
Selected Issue: #${selected.id} - ${selected.title}
Category: ${selected.category}
Ward: ${selected.ward}
Status: ${selected.status}
Assigned Team: ${selected.team}
Assignee: ${selected.assignee}
AI Confidence: ${selected.confidence}%
Severity: ${selected.severity}/100
SLA: ${selected.sla}
Evidence: ${selected.evidence}
Recommended Next Step: ${selected.nextStep}
Public Message: ${selected.publicMessage}`;

    try {
      await navigator.clipboard.writeText(briefing);
      addActivity("System", `Briefing copied for #${selected.id}. Paste it into your submission doc or authority note.`);
    } catch {
      addActivity("System", "Briefing generated. Browser clipboard permission was unavailable, but export action is working.");
    }
  }

  function locateWard() {
    const nearest = issues.find((issue) => issue.ward === "Ward 12") ?? issues[0];
    setSelectedId(nearest.id);
    setQuery(nearest.ward);
    setCategory("All");
    setStatusFilter("All");
    setTeamFilter("All");
    addActivity("System", `Located current area as ${nearest.ward} and focused nearby civic reports.`);
  }

  function startReport() {
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setDraft({
      title: "",
      location: "Use current location",
      details: "",
    });
    addActivity("Citizen", "New citizen report form opened. Add a title, location, description, and evidence.");
  }

  function resetFilters() {
    setQuery("");
    setCategory("All");
    setStatusFilter("All");
    setTeamFilter("All");
    addActivity("System", "All filters cleared. Showing the full civic issue queue.");
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      addActivity("AI", `Evidence file "${file.name}" attached. Gemini analysis preview updated.`);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Hyperlocal Problem Solver</p>
          <h1>CivicPulse AI</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Locate current ward" onClick={locateWard}>
            <LocateFixed size={19} />
          </button>
          <button className="primary-button" onClick={startReport}>
            <UploadCloud size={18} />
            Report Issue
          </button>
        </div>
      </header>

      <nav className="view-switcher" aria-label="CivicPulse workspace views">
        {(["Citizen", "Authority", "Analytics"] as const).map((item) => (
          <button
            key={item}
            className={view === item ? "active" : ""}
            onClick={() => setView(item)}
            aria-label={`Switch to ${item} view`}
          >
            {item === "Citizen" && <Users size={16} />}
            {item === "Authority" && <ClipboardCheck size={16} />}
            {item === "Analytics" && <BarChart3 size={16} />}
            {item}
          </button>
        ))}
        <span>{toast}</span>
      </nav>

      <section className="hero-band">
        <div>
          <p className="eyebrow">Gemini-powered civic operations</p>
          <h2>Report local issues, verify together, resolve faster.</h2>
        </div>
        <div className="hero-stats" aria-label="CivicPulse summary metrics">
          <Metric icon={<AlertTriangle size={18} />} label="Open issues" value={openCount.toString()} />
          <Metric icon={<ShieldCheck size={18} />} label="Verified" value={verifiedCount.toString()} />
          <Metric icon={<CheckCircle2 size={18} />} label="Resolved" value={resolvedCount.toString()} />
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="report-panel" ref={reportRef}>
          <div className="section-heading">
            <Sparkles size={19} />
            <h3>AI Report Intake</h3>
          </div>
          <label>
            Issue title
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label>
            Location
            <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label>
            Description
            <textarea value={draft.details} onChange={(event) => setDraft({ ...draft, details: event.target.value })} />
          </label>
          <label className="upload-tile">
            <ImagePlus size={26} />
            <span>{fileName}</span>
            <input type="file" accept="image/*,video/*" onChange={handleFile} />
          </label>
          <div className="ai-preview">
            <Lightbulb size={18} />
            <span>{ai.summary}</span>
          </div>
          <div className="analysis-stack">
            <AnalysisPill label="Category" value={ai.category} />
            <AnalysisPill label="Confidence" value={`${ai.confidence}%`} />
            <AnalysisPill label="Assigned team" value={ai.team} />
            <AnalysisPill label="Expected SLA" value={ai.sla} />
          </div>
          <button className="primary-button full" onClick={submitReport}>
            <Sparkles size={18} />
            Analyze and Publish
          </button>
        </aside>

        <section className="map-section">
          <div className="map-toolbar">
            <div className="searchbox">
              <Search size={17} />
              <input
                aria-label="Search reports"
                placeholder="Search reports, areas, categories"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="filter-row">
              <Filter size={17} />
              <select value={category} onChange={(event) => setCategory(event.target.value as "All" | Category)}>
                <option>All</option>
                {Object.keys(categoryMeta).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | Status)}>
                <option>All</option>
                <option>Reported</option>
                <option>Verified</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <button className="small-action" onClick={resetFilters} aria-label="Clear filters">
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>

          <div className="city-map" aria-label="Community issue map">
            <div className="map-grid" />
            <div className="road horizontal one" />
            <div className="road horizontal two" />
            <div className="road vertical one" />
            <div className="road vertical two" />
            {filtered.map((issue) => (
              <button
                key={issue.id}
                className={`pin ${selected.id === issue.id ? "active" : ""}`}
                style={{
                  left: `${issue.x}%`,
                  top: `${issue.y}%`,
                  backgroundColor: categoryMeta[issue.category].color,
                }}
                onClick={() => setSelectedId(issue.id)}
                aria-label={`Open ${issue.title}`}
              >
                {categoryMeta[issue.category].short}
              </button>
            ))}
          </div>

          <div className="selected-issue">
            <div>
              <p className="eyebrow">
                {selected.category} - #{selected.id} - {selected.ward}
              </p>
              <h3>{selected.title}</h3>
              <p>{selected.summary}</p>
              <div className="detail-chips">
                <span>Team: {selected.team}</span>
                <span>SLA: {selected.sla}</span>
                <span>Duplicate risk: {selected.duplicateRisk}%</span>
                <span>Assignee: {selected.assignee}</span>
              </div>
            </div>
            <div className="issue-actions">
              <button onClick={() => verifyIssue(selected.id)}>
                <Users size={17} />
                Verify
              </button>
              <button onClick={() => advanceIssue(selected.id)}>
                <Wrench size={17} />
                Advance
              </button>
              <button onClick={() => assignRoute(selected.id)}>
                <Navigation size={17} />
                Route Work Order
              </button>
              <button onClick={() => notifyCitizens(selected.id)}>
                <Bell size={17} />
                Notify
              </button>
            </div>
          </div>
        </section>

        <aside className="insights-panel">
          <div className="section-heading">
            <Gauge size={19} />
            <h3>Priority Command</h3>
          </div>
          <div className="priority-card">
            <p className="eyebrow">Highest priority</p>
            <h4>{topPriority.title}</h4>
            <div className="score-line">
              <span>AI score</span>
              <strong>{topPriority.severity}</strong>
            </div>
            <div className="meter">
              <span style={{ width: `${topPriority.severity}%` }} />
            </div>
            <p className="priority-note">{topPriority.action}</p>
          </div>

          <div className="mini-grid">
            <Metric icon={<BarChart3 size={18} />} label="Citizen reports" value={issues.reduce((sum, i) => sum + i.reports, 0).toString()} />
            <Metric icon={<Clock3 size={18} />} label="Avg. age" value="21h" />
            <Metric icon={<Route size={18} />} label="Routes" value="5" />
            <Metric icon={<Layers3 size={18} />} label="Wards" value="3" />
          </div>

          <div className="timeline">
            {issues.slice(0, 4).map((issue) => (
              <button key={issue.id} onClick={() => setSelectedId(issue.id)}>
                <span style={{ backgroundColor: categoryMeta[issue.category].color }} />
                <div>
                  <strong>{issue.status}</strong>
                  <small>{issue.location}</small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
          <div className="panel-actions">
            <button onClick={() => markDuplicate(selected.id)}>
              <Radio size={16} />
              Scan Duplicates
            </button>
            <button onClick={exportBriefing}>
              <Download size={16} />
              Export Briefing
            </button>
          </div>
        </aside>
      </section>

      <section className="workflow-band">
        <div className="section-heading">
          <Route size={19} />
          <h3>{view} Workflow</h3>
        </div>
        <div className="workflow-grid">
          {getWorkflow(view).map((step) => (
            <button key={step.title} onClick={() => addActivity(step.type, step.message)}>
              <strong>{step.title}</strong>
              <span>{step.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="details-grid">
        <article className="detail-panel">
          <div className="section-heading">
            <Sparkles size={19} />
            <h3>Gemini Analysis</h3>
          </div>
          <div className="evidence-card">
            <p className="eyebrow">Selected report evidence</p>
            <h4>{selected.evidence}</h4>
            <div className="signal-list">
            <AnalysisPill label="Vision confidence" value={`${selected.confidence}%`} />
            <AnalysisPill label="Severity" value={`${selected.severity}/100`} />
            <AnalysisPill label="Citizen validation" value={`${selected.verifiedBy} people`} />
            <AnalysisPill label="Estimated cost" value={selected.costEstimate} />
          </div>
        </div>
      </article>

        <article className="detail-panel">
          <div className="section-heading">
            <Send size={19} />
            <h3>Authority Routing</h3>
          </div>
          <div className="routing-list">
            {["Roads and Safety", "Sanitation", "Water Board", "Electrical"].map((team) => {
              const count = issues.filter((issue) => issue.team === team && issue.status !== "Resolved").length;
              return (
                <button
                  key={team}
                  className="routing-row"
                  onClick={() => {
                    setTeamFilter(team as Team);
                    queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    addActivity("Authority", `Filtered queue for ${team}.`);
                  }}
                >
                  <strong>{team}</strong>
                  <span>{count} open</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="detail-panel">
          <div className="section-heading">
            <Cloud size={19} />
            <h3>Google Stack</h3>
          </div>
          <div className="stack-list">
            <button onClick={() => addActivity("AI", "Gemini Vision simulation refreshed category, confidence, and severity scoring.")}>
              Gemini Vision for issue category, severity, and evidence summary
            </button>
            <button onClick={locateWard}>Google Maps Platform for geotagged reporting and ward clusters</button>
            <button onClick={() => addActivity("System", "Firestore sync simulated: reports, votes, and statuses are live.")}>
              Firebase/Firestore for live reports, status, and verification
            </button>
            <button onClick={() => addActivity("System", "Cloud Run deployment path ready for production submission.")}>
              Cloud Run for deployed app and API workflow
            </button>
          </div>
        </article>

        <article className="detail-panel">
          <div className="section-heading">
            <Target size={19} />
            <h3>Judging Fit</h3>
          </div>
          <div className="stack-list">
            <button onClick={() => setView("Citizen")}>Problem Solving: transparent local issue resolution</button>
            <button onClick={() => setView("Analytics")}>Agentic Depth: classification, routing, duplicate risk, priority scoring</button>
            <button onClick={() => setView("Authority")}>Product Experience: citizen, community, and authority workflow in one app</button>
          </div>
        </article>
      </section>

      <section className="activity-grid">
        <article className="detail-panel">
          <div className="section-heading">
            <Radio size={19} />
            <h3>Live Activity</h3>
          </div>
          <div className="activity-list">
            {activities.map((activity) => (
              <button key={activity.id} onClick={() => setToast(activity.message)}>
                <strong>{activity.type}</strong>
                <span>{activity.message}</span>
                <small>{activity.time}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="detail-panel">
          <div className="section-heading">
            <ClipboardCheck size={19} />
            <h3>Selected Work Order</h3>
          </div>
          <div className="work-order">
            <AnalysisPill label="Issue ID" value={`#${selected.id}`} />
            <AnalysisPill label="Owner" value={selected.assignee} />
            <AnalysisPill label="Last update" value={selected.lastUpdate} />
            <p>{selected.nextStep}</p>
            <div className="panel-actions compact">
              <button onClick={() => assignRoute(selected.id)}>
                <Send size={16} />
                Create Ticket
              </button>
              <button onClick={() => advanceIssue(selected.id)}>
                <CheckCircle2 size={16} />
                Update Status
              </button>
              <button onClick={() => notifyCitizens(selected.id)}>
                <Bell size={16} />
                Public Update
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="issue-table" ref={queueRef}>
        <div className="section-heading">
          <MessageSquareText size={19} />
          <h3>Live Issue Queue</h3>
          <button className="queue-count" onClick={resetFilters}>
            {filtered.length} visible
            <XCircle size={15} />
          </button>
        </div>
        <div className="table">
          {filtered.map((issue) => (
            <button className="table-row" key={issue.id} onClick={() => setSelectedId(issue.id)}>
              <span>{issue.title}</span>
              <span>{issue.location}</span>
              <span className="badge" style={{ borderColor: categoryMeta[issue.category].color }}>
                {issue.category}
              </span>
              <span>{issue.team}</span>
              <span>{issue.status}</span>
              <strong>{issue.severity}</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function AnalysisPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="analysis-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getWorkflow(view: "Citizen" | "Authority" | "Analytics") {
  if (view === "Authority") {
    return [
      {
        title: "Review AI Evidence",
        detail: "Compare image evidence, citizen reports, and duplicate risk before accepting.",
        type: "Authority" as ActivityType,
        message: "Authority reviewed AI evidence and validation signals.",
      },
      {
        title: "Assign Field Crew",
        detail: "Send issue to the correct department with SLA and estimated effort.",
        type: "Authority" as ActivityType,
        message: "Field crew assignment simulated with SLA and routing notes.",
      },
      {
        title: "Publish Update",
        detail: "Notify citizens when status moves from reported to verified to resolved.",
        type: "System" as ActivityType,
        message: "Public status update sent to citizens following this issue.",
      },
      {
        title: "Close With Proof",
        detail: "Require final photo/evidence and community confirmation before closing.",
        type: "Authority" as ActivityType,
        message: "Closure workflow checked for proof and citizen confirmation.",
      },
    ];
  }

  if (view === "Analytics") {
    return [
      {
        title: "Hotspot Detection",
        detail: "Cluster repeated reports by ward, road, category, and time window.",
        type: "AI" as ActivityType,
        message: "Hotspot detection simulated for repeated local infrastructure issues.",
      },
      {
        title: "Priority Forecast",
        detail: "Predict which open issues will become urgent if not handled quickly.",
        type: "AI" as ActivityType,
        message: "Priority forecast refreshed using severity, age, and citizen validation.",
      },
      {
        title: "Budget Impact",
        detail: "Estimate rough repair cost and compare it with ward-level trends.",
        type: "System" as ActivityType,
        message: "Budget impact model generated estimated repair load by team.",
      },
      {
        title: "Submission Story",
        detail: "Show impact, Google technology use, agentic depth, and usability.",
        type: "System" as ActivityType,
        message: "Judging narrative highlighted impact, Google stack, and agentic workflow.",
      },
    ];
  }

  return [
    {
      title: "Capture Evidence",
      detail: "Upload photo/video and let Gemini summarize visible civic damage.",
      type: "Citizen" as ActivityType,
      message: "Citizen evidence capture workflow opened.",
    },
    {
      title: "Verify Nearby",
      detail: "Residents confirm, upvote, and add duplicate reports from the same area.",
      type: "Citizen" as ActivityType,
      message: "Community verification workflow simulated.",
    },
    {
      title: "Track Status",
      detail: "Watch every report move through transparent public statuses.",
      type: "Citizen" as ActivityType,
      message: "Status tracking highlighted for citizen transparency.",
    },
    {
      title: "Reopen If Needed",
      detail: "Resolved issues can be monitored and reopened if the problem returns.",
      type: "Citizen" as ActivityType,
      message: "Reopen workflow demonstrated for recurring civic problems.",
    },
  ];
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
