import { useRef, useState } from 'react'
import Sidebar from './Sidebar'
import './upload.css'

const advice = [
  ['زاوية الكاميرا المرتفعة (High Angle)', 'كاميرا علوية تكتيكية أو بث تلفزيوني يغطي ثلثي الملعب على الأقل لضمان رصد تموضع الـ 22 لاعبًا.'],
  ['ثبات الإطار وتجنب التقريب (No Zoom)', 'تثبيت حامل الكاميرا وتجنب الاهتزاز المفاجئ أو التقريب المفرط أثناء اللعب المفتوح للحفاظ على المرجع المكاني.'],
  ['وضوح خطوط الملعب (Homography)', 'وضوح خطوط التماس ومنطقة الجزاء لمعايرة الإحداثيات الهندسية التلقائية والتحويل ثنائي الأبعاد.'],
  ['تباين أرقام القمصان وإضاءة الملعب', 'إضاءة كافية للملعب لتمييز اللاعبين وإعادة التعرف البصري (Player Re-Identification) بدقة عالية.'],
]

function UploadCloud() { return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 34h22a8 8 0 0 0 .7-16 12 12 0 0 0-23.2 2.1A7 7 0 0 0 13 34Z"/><path d="m18 25 6-6 6 6M24 19v15"/></svg> }

export default function Upload() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const choose = (candidate?: File) => {
    setError('')
    if (!candidate) return
    if (!['video/mp4','video/quicktime','video/x-msvideo'].includes(candidate.type)) { setError('الصيغ المدعومة هي MP4 وMOV وAVI.'); return }
    if (candidate.size > 2 * 1024 * 1024 * 1024) { setError('الحد الأقصى لحجم الفيديو هو 2 جيجابايت.'); return }
    setFile(candidate)
  }
  return <div className="upload-layout" dir="rtl"><Sidebar active="upload"/><main className="upload-main">
    <header className="upload-heading"><div><div className="upload-eyebrow">▣ المرصد التكتيكي • وحدة استيراد الوسائط</div><h1>رفع فيديو المباراة</h1><p>ارفع تسجيل اللقاء الميداني لبدء خوارزميات الاستشعار البصري ورصد تموضع الـ 22 لاعبًا واستخراج الإحصائيات التكتيكية المتقدمة.</p></div><span className="ready-label"><i/> نظام التتبع البصري: نمط الاستعداد الفوري</span></header>
    <nav className="upload-steps">{[['١','الخطوة الأولى · جارية','رفع ملف الفيديو'],['٢','الخطوة الثانية','معايرة ومزامنة الإحداثيات'],['٣','الخطوة الثالثة','استخراج الأحداث والتكتيك'],['٤','الخطوة الرابعة','التقارير والمخرجات الرقمية']].map(([n,title,subtitle],index)=><div className={`upload-step ${index===0?'step-current':''}`} key={n}><span>{n}</span><div><b>{title}</b><small>{subtitle}</small></div></div>)}</nav>
    <div className="upload-workspace"><aside className="guidance"><h2>▣ إرشادات التصوير لرؤية الآلة</h2><p className="guidance-intro">تعتمد دقة محرك الذكاء الاصطناعي (AI Computer Vision) على توافق زوايا الكاميرا مع المعايير التكتيكية الميدانية:</p>{advice.map(([title,description],index)=><div className="advice" key={title}><span>{index+1}</span><div><b>{title}</b><p>{description}</p></div></div>)}<div className="ai-note"><span>♙</span><div><b>معايرة الذكاء الاصطناعي الأوتوماتيكية</b><small>يتم تعيين شبكة الملعب Pitch 2D فور اكتمال الرفع</small></div></div></aside>
      <section className={`drop-panel ${dragging?'is-dragging':''}`} onDragOver={event=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);choose(event.dataTransfer.files[0])}}><input ref={fileInput} hidden type="file" accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi" onChange={event=>choose(event.target.files?.[0])}/>{file?<div className="picked-file"><div className="video-preview"><div className="play">▶</div><span>09:42</span></div><div className="picked-info"><b>{file.name}</b><small>تم اختيار الملف من جهازك</small><span>{(file.size/1024/1024/1024).toFixed(2)} GB　·　MP4　·　1080p @ 60fps</span></div><button type="button" className="remove-file" onClick={()=>setFile(null)}>×</button></div>:<div className="drop-content" onClick={()=>fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();fileInput.current?.click()}}}><div className="drop-icon"><UploadCloud/></div><h2>اسحب وأفلت ملف الفيديو هنا</h2><p>أو تصفح جهازك لاختيار ملف مصور للمباراة بصيغة رقمية فائقة الوضوح</p><button type="button" onClick={event=>{event.stopPropagation();fileInput.current?.click()}}>اختر ملف من جهازك　⇧</button></div>}{error&&<p className="upload-error" role="alert">{error}</p>}<div className="file-specs"><span>⊙　الصيغ المدعومة: <b>MP4, MOV, AVI</b></span><i>•</i><span>◉　أقصى حجم للملف: <b>2.0 جيجابايت</b></span><i>•</i><span>▣　1080p بمعدل 60 إطار/ثانية</span></div></section>
    </div>
    <div className="upload-actionbar"><button className="start-analysis">بدء التحليل التكتيكي　←</button><span>يتطلب إطلاق التحليل ملفًا صالحًا واكتمال الحقول الإلزامية</span><div><button>→ العودة للوحة التحكم</button><button>حفظ كمسودة　▢</button></div></div>
    <div className="upload-lower"><aside className="readiness"><h2><i/> فحص الجاهزية قبل البدء</h2>{['تحديد الفريق والمنافس','تاريخ وتوقيت اللقاء الميداني','ملف الفيديو مستوفي للشروط (MP4)','التشكيل الأولي 3-3-3 معتمد'].map(item=><div key={item}><span>✓</span>{item}</div>)}<div className="simulation-note"><b>إشعار الشفافية الرياضية الميدانية — وضع المحاكاة التكتيكية</b><p>البيانات تجريبية (Demo Simulation). جودة الاستنتاجات والإحصائيات التكتيكية ترتبط مباشرة بسلامة زوايا الرؤية ووضوح البث.</p></div></aside>
      <section className="match-form"><header><h2>▣ بطاقة بيانات ومحيط اللقاء</h2><small>سجل إلزامي</small></header><div className="form-grid"><label>الفريق المستضيف (الرئيسي) <em>*</em><span>الأكاديمية الخضراء (Green Academy)　♧</span></label><label>الفريق المنافس (الضيف) <em>*</em><span>نادي المدينة (City Club)　⚑</span></label><label>تاريخ إقامة المباراة<span>24 أكتوبر 2026　▢</span></label><label>التشكيل التكتيكي المبدئي<span>3-3-3 هجومي (Offensive)　⌄</span></label><label>زاوية الكاميرا الميدانية<span>كاميرا تكتيكية علوية (High-Cam / Tactical Mast)　◎</span></label><label>نوع ومستوى البطولة<span>دوري النخبة تحت 21 سنة　♜</span></label></div><div className="status-simulation"><b>☷ محاكاة اختبار الحالات المرحلية:</b><span>جاهز للرفع</span><span className="processing">جاري الرفع (78%)</span><span>مكتمل ومعتمد</span><span>حالة خطأ تجاوز</span></div><section className="file-status"><header><h3>▣ الملف المرفوع للتحليل</h3><span>⟳ جاري معالجة وتدقيق الرفع (78%)</span></header><div className="file-status-body"><div className="fake-video"><span>▶</span><small>94:12</small></div><div className="fake-file"><b>{file?.name || 'AlKhadraa_vs_AlMadina_Round14_FullMatch.mp4'}</b><small>تم الاستيراد من وحدة التخزين المشفرة</small><div><span>1.84 GB</span><span>MP4 (H.264)</span><span>1080p @ 60fps</span><span>✓ ترميز سليم</span></div></div></div><b className="progress-title">محاكاة تقدم الرفع التجريبي <span>78%</span></b><div className="progress-track"><i/></div><small className="progress-note">تم نقل 1.44 GB من أصل 1.84 GB　•　متبقي 12 ثانية　•　34.2 MB/s</small></section></section>
    </div>
  </main></div>
}
