"use client";

import { useEffect, useMemo, useState } from "react";

const initialData = {
  name: "",
  school: "",
  program: "",
  semester: "",
  goal: "",
  courses: [],
  assignments: [],
  exams: [],
  habits: {},
  notes: [],
  sessions: [],
  grades: []
};

const nav = [
  ["dashboard", "⌂", "Dashboard"],
  ["planner", "▣", "Planner"],
  ["assignments", "✓", "Assignments"],
  ["exams", "◷", "Exams"],
  ["revision", "↗", "Revision"],
  ["grades", "▤", "Grades"],
  ["habits", "●", "Habits"],
  ["notes", "✎", "Notes"],
  ["ai", "✦", "StudyBloom AI"]
];

function loadData() {
  if (typeof window === "undefined") return initialData;
  try {
    return { ...initialData, ...JSON.parse(localStorage.getItem("studybloom-data") || "{}") };
  } catch { return initialData; }
}

function Card({ title, children, action }) {
  return <section className="card"><div className="cardHead"><h3>{title}</h3>{action}</div>{children}</section>;
}

export default function Home() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState("dashboard");
  const [onboard, setOnboard] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadData();
    setData(saved);
    setOnboard(!saved.name);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("studybloom-data", JSON.stringify(data));
  }, [data, ready]);

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const upcoming = [...data.assignments, ...data.exams].slice(0, 5);

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  if (!ready) return <div className="splash">StudyBloom</div>;
  if (onboard) return <Onboarding data={data} onSave={(d) => { update(d); setOnboard(false); }} />;

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><span className="logo">✦</span><div><b>StudyBloom</b><small>Student planner</small></div></div>
        <nav>{nav.map(([id, icon, label]) =>
          <button key={id} className={page === id ? "navItem active" : "navItem"} onClick={() => setPage(id)}>
            <span>{icon}</span>{label}
          </button>
        )}</nav>
        <button className="settings" onClick={() => setPage("settings")}>⚙ Settings</button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">{today}</span><h1>{pageTitle(page)}</h1></div>
          <div className="profile"><span>{initials(data.name)}</span><b>{data.name}</b></div>
        </header>

        {page === "dashboard" && <Dashboard data={data} setPage={setPage} upcoming={upcoming} />}
        {page === "planner" && <Planner data={data} update={update} />}
        {page === "assignments" && <ListManager title="Assignments & Projects" type="assignments" data={data} update={update} />}
        {page === "exams" && <ListManager title="Exam & Assessment Tracker" type="exams" data={data} update={update} />}
        {page === "revision" && <Revision data={data} update={update} />}
        {page === "grades" && <Grades data={data} update={update} />}
        {page === "habits" && <Habits data={data} update={update} />}
        {page === "notes" && <Notes data={data} update={update} />}
        {page === "ai" && <AI data={data} />}
        {page === "settings" && <Settings data={data} update={update} />}
      </main>
    </div>
  );
}

function pageTitle(p) {
  return ({dashboard:"Dashboard",planner:"My Planner",assignments:"Assignments",exams:"Exams",revision:"Revision Planner",grades:"Grade Tracker",habits:"Habit Tracker",notes:"Notes & Brain Dump",ai:"StudyBloom AI",settings:"Settings"})[p] || "StudyBloom";
}
function initials(name) { return name ? name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase() : "S"; }

function Onboarding({ data, onSave }) {
  const [form, setForm] = useState({ name:data.name, school:data.school, program:data.program, semester:data.semester, goal:data.goal, courses:data.courses.join(", ") });
  const submit = e => { e.preventDefault(); onSave({...form, courses: form.courses.split(",").map(x=>x.trim()).filter(Boolean)}); };
  return <div className="onboard"><div className="onboardBox">
    <div className="brand big"><span className="logo">✦</span><div><b>StudyBloom</b><small>Plan smarter • Study better • Achieve more</small></div></div>
    <h1>Let’s set up your study space.</h1><p>Tell us a little about yourself. You can change everything later.</p>
    <form onSubmit={submit}>
      <label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Alex" /></label>
      <div className="two"><label>School / University<input value={form.school} onChange={e=>setForm({...form,school:e.target.value})} /></label><label>Program / Course<input value={form.program} onChange={e=>setForm({...form,program:e.target.value})} /></label></div>
      <div className="two"><label>Semester / term<input value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} placeholder="e.g. Semester 1" /></label><label>Target GPA / grade<input value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})} placeholder="e.g. 3.5 / 80%" /></label></div>
      <label>Courses / subjects <span className="muted">(separate with commas)</span><input value={form.courses} onChange={e=>setForm({...form,courses:e.target.value})} placeholder="Math, Biology, History" /></label>
      <button className="primary full">Enter StudyBloom →</button>
    </form>
  </div></div>;
}

function Dashboard({data,setPage,upcoming}) {
  const courseCount = data.courses.length;
  return <div className="content">
    <div className="hero"><div><span className="eyebrow">Welcome back</span><h2>{data.name} 👋</h2><p>{data.goal ? `Your target: ${data.goal}` : "Your goals deserve a plan."}</p></div><button className="primary" onClick={()=>setPage("planner")}>Plan my day</button></div>
    <div className="stats"><div><b>{courseCount}</b><span>Courses</span></div><div><b>{data.assignments.length}</b><span>Assignments</span></div><div><b>{data.exams.length}</b><span>Assessments</span></div><div><b>{data.sessions.length}</b><span>Study sessions</span></div></div>
    <div className="grid2"><Card title="My Big 3 Goals"><GoalList data={data}/></Card><Card title="Quick Wins"><div className="checks">{["Attend important classes","Review notes within 24 hours","Start assignments early","Practice active recall","Protect sleep / rest","Ask for help when needed"].map(x=><label key={x}><input type="checkbox"/><span>{x}</span></label>)}</div></Card></div>
    <Card title="Upcoming"><div className="upcoming">{upcoming.length ? upcoming.map((x,i)=><div className="row" key={i}><div><b>{x.title || x.name || "Untitled"}</b><small>{x.course || "General"}</small></div><span>{x.due || x.date || "No date"}</span></div>) : <Empty text="No upcoming items yet. Add an assignment or assessment."/>}</div></Card>
  </div>;
}
function GoalList({data}) { return <div className="goals">{[0,1,2].map(i=><div key={i}><span>{i+1}</span><input value={data[`goal${i}`]||""} readOnly placeholder="Set a goal in Settings" /></div>)}</div>; }
function Empty({text}) { return <div className="empty">{text}</div>; }

function Planner({data,update}) {
  const [mode,setMode]=useState("daily");
  return <div className="content"><div className="tabs">{["daily","weekly","monthly","semester"].map(x=><button className={mode===x?"tab active":"tab"} onClick={()=>setMode(x)} key={x}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div>
    {mode==="daily" && <Daily data={data} update={update}/>}
    {mode==="weekly" && <SimplePlanner title="Weekly Planner" prompts={["Week of","Weekly goal","Top 3 tasks","Deadlines / events","Weekly reflection"]}/>}
    {mode==="monthly" && <SimplePlanner title="Monthly Planner" prompts={["Month","Main goal","Top priorities","Important dates & deadlines","Habits","Month reflection"]}/>}
    {mode==="semester" && <SimplePlanner title="Semester Overview" prompts={["Semester / term","Start date","End date","Target GPA","Important semester dates"]}/>}
  </div>;
}
function Daily({data,update}) {
  const [goal,setGoal]=useState(""); const [subject,setSubject]=useState(""); const [topic,setTopic]=useState(""); const [start,setStart]=useState(""); const [end,setEnd]=useState("");
  const add=()=>{ if(!subject) return; update({sessions:[...data.sessions,{subject,topic,start,end,date:new Date().toLocaleDateString()}]}); setSubject("");setTopic(""); };
  return <div className="grid2"><Card title="Today's Main Goal"><textarea value={goal} onChange={e=>setGoal(e.target.value)} placeholder="What matters most today?"/><div className="spacer"/><h4>Top 3</h4>{[1,2,3].map(i=><input className="stack" key={i} placeholder={`Task ${i}`}/>)}</Card>
  <Card title="Study Session Planner"><div className="two"><label>Subject / course<input value={subject} onChange={e=>setSubject(e.target.value)}/></label><label>Topic<input value={topic} onChange={e=>setTopic(e.target.value)}/></label></div><div className="two"><label>Start<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label></div><label>Study method<select><option>Active recall</option><option>Practice questions</option><option>Flashcards</option><option>Past papers</option><option>Teach someone</option><option>Summarize</option></select></label><button className="primary" onClick={add}>Save session</button></Card></div>;
}
function SimplePlanner({title,prompts}) { return <Card title={title}>{prompts.map(p=><label key={p}>{p}<textarea placeholder={`Write ${p.toLowerCase()}...`}/></label>)}</Card>; }

function ListManager({title,type,data,update}) {
  const [item,setItem]=useState({title:"",course:"",due:"",priority:"Medium",status:"Not started"});
  const add=()=>{if(!item.title)return;update({[type]:[...data[type],item]});setItem({title:"",course:"",due:"",priority:"Medium",status:"Not started"});};
  return <div className="content"><Card title={title}><div className="formGrid"><input placeholder="Task / assessment" value={item.title} onChange={e=>setItem({...item,title:e.target.value})}/><input placeholder="Course / subject" value={item.course} onChange={e=>setItem({...item,course:e.target.value})}/><input type="date" value={item.due} onChange={e=>setItem({...item,due:e.target.value})}/><select value={item.priority} onChange={e=>setItem({...item,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select><button className="primary" onClick={add}>Add</button></div>
    <div className="table">{data[type].map((x,i)=><div className="tableRow" key={i}><b>{x.title}</b><span>{x.course}</span><span>{x.due}</span><span>{x.priority}</span><button onClick={()=>update({[type]:data[type].filter((_,j)=>j!==i)})}>×</button></div>)}</div>{!data[type].length&&<Empty text="Nothing here yet. Add your first item above."/>}</Card></div>;
}

function Revision({data,update}) {
  const [x,setX]=useState({subject:"",topic:"",status:"Not started",confidence:"Low",next:""});
  const add=()=>{if(!x.topic)return;update({revision:[...(data.revision||[]),x]});setX({subject:"",topic:"",status:"Not started",confidence:"Low",next:""});};
  const rows=data.revision||[];
  return <div className="content"><Card title="Topic-by-Topic Revision"><div className="formGrid"><input placeholder="Subject" value={x.subject} onChange={e=>setX({...x,subject:e.target.value})}/><input placeholder="Topic" value={x.topic} onChange={e=>setX({...x,topic:e.target.value})}/><select value={x.confidence} onChange={e=>setX({...x,confidence:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select><input type="date" value={x.next} onChange={e=>setX({...x,next:e.target.value})}/><button className="primary" onClick={add}>Add topic</button></div>{rows.map((r,i)=><div className="row" key={i}><div><b>{r.topic}</b><small>{r.subject}</small></div><span>{r.confidence} confidence · {r.next||"No review date"}</span></div>)}</Card></div>;
}

function Grades({data,update}) {
  const [x,setX]=useState({course:"",test:"",assignment:"",exam:""});
  const add=()=>{if(!x.course)return;update({grades:[...data.grades,x]});setX({course:"",test:"",assignment:"",exam:""});};
  return <div className="content"><Card title="Course Grade Record"><div className="formGrid"><input placeholder="Course" value={x.course} onChange={e=>setX({...x,course:e.target.value})}/><input placeholder="Test / Quiz" value={x.test} onChange={e=>setX({...x,test:e.target.value})}/><input placeholder="Assignment" value={x.assignment} onChange={e=>setX({...x,assignment:e.target.value})}/><input placeholder="Exam" value={x.exam} onChange={e=>setX({...x,exam:e.target.value})}/><button className="primary" onClick={add}>Save</button></div>{data.grades.map((g,i)=><div className="row" key={i}><b>{g.course}</b><span>Test: {g.test||"—"} · Assignment: {g.assignment||"—"} · Exam: {g.exam||"—"}</span></div>)}</Card></div>;
}

function Habits({data,update}) {
  const habits=["Study","Review notes","Exercise","Sleep 7+ hrs","Water","Reading","No procrastination"];
  const today=new Date().toISOString().slice(0,10);
  const toggle=h=>update({habits:{...data.habits,[`${today}-${h}`]:!data.habits[`${today}-${h}`]}});
  return <div className="content"><Card title="Daily Habit Check"><p className="muted">{today}</p><div className="habitGrid">{habits.map(h=><button key={h} className={data.habits[`${today}-${h}`]?"habit done":"habit"} onClick={()=>toggle(h)}><span>{data.habits[`${today}-${h}`]?"✓":"○"}</span>{h}</button>)}</div></Card></div>;
}

function Notes({data,update}) {
  const [note,setNote]=useState("");
  const add=()=>{if(!note.trim())return;update({notes:[...data.notes,{text:note,date:new Date().toLocaleString()}]});setNote("");};
  return <div className="content"><Card title="Notes & Brain Dump"><textarea className="bigArea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Write anything you need to remember..."/><button className="primary" onClick={add}>Save note</button><div className="notes">{data.notes.map((n,i)=><div className="note" key={i}><small>{n.date}</small><p>{n.text}</p></div>)}</div></Card></div>;
}

function AI({data}) {
  const [q,setQ]=useState("");
  const [answer,setAnswer]=useState("");
  const [loading,setLoading]=useState(false);

  function localTutor(question) {
    const s = question.toLowerCase().trim();
    const subject = data.courses?.join(", ") || "your subjects";

    if (s.includes("photosynthesis")) {
      return `Photosynthesis is the process by which green plants make food using light energy.\n\nSimple steps:\n1. Chlorophyll absorbs light energy.\n2. The plant takes in carbon dioxide from the air.\n3. Roots absorb water from the soil.\n4. Light energy is used to convert carbon dioxide and water into glucose.\n5. Oxygen is released as a by-product.\n\nOverall equation:\nCarbon dioxide + water → glucose + oxygen (using light and chlorophyll).\n\nStudy tip: Remember the three key inputs/conditions: light, water and carbon dioxide.`;
    }

    if (s.includes("quiz") || s.includes("mcq") || s.includes("questions")) {
      return `Quick self-test for ${subject}:\n\n1. What is the main idea of the topic you are studying?\nA. Write one possible answer\nB. Write another possible answer\nC. Write another possible answer\nD. Write another possible answer\n\n2. What are two key terms you should remember?\n\n3. Explain the topic in three sentences without looking at your notes.\n\nSend me the topic and I can turn the topic you type into a focused practice set.`;
    }

    if (s.includes("flashcard")) {
      return `Flashcard method:\n\nFront: What is the definition/main idea?\nBack: Give the definition in one or two sentences.\n\nFront: What are the key steps?\nBack: List the steps in order.\n\nFront: What is an important example?\nBack: Give one example and explain why it fits.\n\nFront: What is commonly confused with this topic?\nBack: State the difference clearly.`;
    }

    if (s.includes("study plan") || s.includes("timetable") || s.includes("schedule")) {
      return `Simple study plan:\n\n• 10 min — Preview the topic\n• 35 min — Learn/review the material\n• 10 min — Short break\n• 30 min — Active recall or practice questions\n• 10 min — Check mistakes\n• 5 min — Write what to review next\n\nRepeat the cycle for another subject if you have enough time.`;
    }

    if (s.includes("summarize") || s.includes("summary")) {
      return `For a good study summary, reduce the material to:\n\n1. Definition / main idea\n2. 3–5 key points\n3. Important processes or steps\n4. One example\n5. One common mistake\n\nPaste the actual notes into this box and I can help organize them into a concise study summary.`;
    }

    if (s.includes("hello") || s.includes("hi ") || s === "hi") {
      return `Hey ${data.name || "there"}! 🌱 I’m your StudyBloom Smart Tutor. Ask me to explain a topic, create a study plan, make flashcards, or quiz you.`;
    }

    return `I can help you study without an API key. 🌱\n\nTry asking:\n• "Explain photosynthesis simply"\n• "Make me a quiz on cell biology"\n• "Give me flashcards for genetics"\n• "Make a study plan for tomorrow"\n• "Summarize this topic"\n\nFor your current courses: ${subject}.`;
  }

  function ask() {
    if (!q.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setAnswer(localTutor(q));
      setLoading(false);
    }, 250);
  }

  return <div className="content"><div className="aiBox">
    <div className="aiIcon">✦</div>
    <h2>StudyBloom Smart Tutor</h2>
    <p>No API key needed. Get instant study help built into the app.</p>
    <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. Explain photosynthesis in simple terms..." />
    <button className="primary" onClick={ask} disabled={loading}>{loading?"Thinking…":"Ask StudyBloom"}</button>
    {answer&&<div className="answer"><b>StudyBloom</b><p>{answer}</p></div>}
  </div></div>;
}

function Settings({data,update}) {
  const [form,setForm]=useState(data);
  const save=()=>update({...form,courses:typeof form.courses==="string"?form.courses.split(",").map(x=>x.trim()).filter(Boolean):form.courses});
  return <div className="content"><Card title="Profile & Academic Setup"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><div className="two"><label>School<input value={form.school} onChange={e=>setForm({...form,school:e.target.value})}/></label><label>Program<input value={form.program} onChange={e=>setForm({...form,program:e.target.value})}/></label></div><label>Courses / subjects<input value={Array.isArray(form.courses)?form.courses.join(", "):form.courses} onChange={e=>setForm({...form,courses:e.target.value})}/></label><button className="primary" onClick={save}>Save changes</button></Card></div>;
}
