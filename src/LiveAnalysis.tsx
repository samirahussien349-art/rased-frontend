
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Cpu,
  FileVideo,
  Fingerprint,
  Gauge,
  Grid2X2,
  Maximize,
  Pause,
  Play,
  Radio,
  ScanLine,
  ShieldCheck,
  Users,
  Video,
  XCircle,
} from 'lucide-react'
import Sidebar from './Sidebar'
import { useAnalysisPolling } from './hooks/useVideoAnalysis'
import { ANALYSIS_QUERY_PARAM } from './utils/constants'
import './LiveAnalysis.css'

const demoFrames = [
  { number: '115,816', time: '32:09.6', label: 'بداية كرة ثانية', active: false },
  { number: '115,817', time: '32:09.7', label: 'بداية تمريرة', active: false },
  { number: '115,818', time: '32:09.8', label: 'رصد حركة', active: false },
  { number: '115,819', time: '32:09.9', label: 'تتبع الكرة', active: false },
  { number: '115,820', time: '32:10.0', label: 'التحليل الحالي', active: true },
]

const pipeline = [
  { title: 'استخراج الفريمات', detail: 'تم استخراج 339,120 إطارًا بنجاح', status: 'done' },
  { title: 'اكتشاف اللاعبين والكرة', detail: 'YOLOv8x · اكتشاف بصري', status: 'running' },
  { title: 'تتبع الحركة بين الفريمات', detail: 'ByteTrack + DeepSORT', status: 'pending' },
  { title: 'حساب التموضع المكاني', detail: 'تحويل الإحداثيات إلى خريطة الملعب', status: 'pending' },
  { title: 'تجميع الإحصائيات التكتيكية', detail: 'انتظار اكتمال مراحل التتبع', status: 'pending' },
]

const stats = [
  { label: 'إجمالي الفريمات', value: '339,120', detail: 'بمعدل 60 إطارًا بالثانية', icon: Video },
  { label: 'الفريمات المعالجة', value: '115,820', detail: '34.1% من الإجمالي', icon: CheckCircle2 },
  { label: 'الفريمات المتبقية', value: '223,300', detail: 'بانتظار المعالجة', icon: Clock3 },
  { label: 'الوقت المقدر للانتهاء', value: '01:04:15', detail: 'تقدير تجريبي', icon: Gauge },
]

const statusLabels: Record<string, string> = {
  PENDING: 'في قائمة الانتظار',
  PROCESSING: 'قيد المعالجة',
  COMPLETED: 'مكتمل',
  FAILED: 'فشل التحليل',
}

export default function LiveAnalysis() {
  const [searchParams] = useSearchParams()
  const analysisId = searchParams.get(ANALYSIS_QUERY_PARAM)
  const poll = useAnalysisPolling(analysisId)
  const live = Boolean(analysisId)
  const status = poll.data?.status ?? null
  const statusLabel = status ? statusLabels[status] : 'جاري جلب الحالة…'
  const [progress] = useState(34.1)
  const [selectedFrame, setSelectedFrame] = useState('115,820')
  const [playing, setPlaying] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [simulation, setSimulation] = useState(true)

  return (
    <div className="live-layout" dir="rtl">
      <Sidebar active="analysis" />

      <main className="live-main">
        <header className="live-topbar">
          <div className="live-brand">
            <span className="live-brand-icon">ر</span>
            <div>
              <b>RASED | راصد</b>
              <small>منظومة التحليل الرياضي</small>
            </div>
          </div>

          <div className="live-topbar-center">
            <span className="live-demo-pill">
              <Activity size={14} />
              {live ? 'حالة التحليل حقيقية من الخادم' : 'بيانات تجريبية — وضع المحاكاة'}
            </span>
          </div>

          <div className="live-user">
            <span className="live-avatar">م</span>
            <div>
              <b>محلل الأداء الفني</b>
              <small>وحدة التحليل التكتيكي</small>
            </div>
          </div>
        </header>

        <section className="live-intro">
          <div className="live-intro-copy">
            <div className="live-eyebrow">
              <span className="live-status-dot" />
              محرك الرؤية الحاسوبية
              <span className="live-task-id">TASK-ID: {live ? analysisId : '#RSD-DEMO-001'}</span>
            </div>

            <h1>{status === 'COMPLETED' ? 'اكتمل تحليل المباراة' : status === 'FAILED' ? 'تعذّر تحليل المباراة' : 'جاري تحليل المباراة'}</h1>
            <p>
              متابعة معالجة الفيديو واكتشاف اللاعبين والكرة وتحليل الحركة
              والإحصائيات التكتيكية في الوقت الفعلي.
            </p>
          </div>

          <div className="live-progress-summary">
            <div className="live-progress-number">{live ? statusLabel : `${progress}%`}</div>
            {live ? (
              <small>الخادم لا يوفّر نسبة تقدم تفصيلية، فقط الحالة العامة.</small>
            ) : (
              <>
                <div className="live-progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <small>نسبة المعالجة التجريبية</small>
              </>
            )}
          </div>
        </section>

        <section className="live-steps" aria-label="مراحل التحليل">
          <div className="live-step is-complete">
            <Check size={17} />
            <div>
              <b>١. رفع ملف الفيديو</b>
              <small>{live ? 'مكتمل' : 'مكتمل — تجريبي'}</small>
            </div>
          </div>

          <div className={`live-step ${live ? (status === 'COMPLETED' ? 'is-complete' : status === 'FAILED' ? '' : 'is-current') : 'is-current'}`}>
            <ScanLine size={19} />
            <div>
              <b>٢. معايرة الإحداثيات والتتبع</b>
              <small>{live ? statusLabel : 'جاري التنفيذ — تجريبي'}</small>
            </div>
          </div>

          <div className={`live-step ${status === 'COMPLETED' ? 'is-complete' : ''}`}>
            <Clock3 size={18} />
            <div>
              <b>٣. استخراج الأحداث</b>
              <small>في الانتظار</small>
            </div>
          </div>

          <div className={`live-step ${status === 'COMPLETED' ? 'is-complete' : ''}`}>
            <BarChart3 size={18} />
            <div>
              <b>٤. التقارير والمخرجات</b>
              <small>في الانتظار</small>
            </div>
          </div>
        </section>

        {live && (
          <section className="live-card" aria-live="polite" style={{ padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>حالة التحليل الفعلية</h2>
            {poll.error ? (
              <p role="alert">{poll.error} <Link to="/upload">العودة لرفع فيديو جديد</Link></p>
            ) : poll.timedOut ? (
              <p role="alert">استغرق التحليل وقتًا أطول من المتوقع. أعد تحميل الصفحة لمتابعة الحالة لاحقًا.</p>
            ) : !poll.data ? (
              <p>جاري جلب حالة التحليل…</p>
            ) : poll.data.status === 'FAILED' ? (
              <p role="alert">فشل التحليل على الخادم. يمكنك المحاولة مرة أخرى برفع الفيديو من جديد. <Link to="/upload">رفع فيديو</Link></p>
            ) : poll.data.status === 'COMPLETED' ? (
              poll.data.result == null ? (
                <p>اكتمل التحليل لكن الخادم لم يُرجع نتائج بعد.</p>
              ) : (
                <>
                  <p>اكتمل التحليل. هذه النتيجة الخام كما أرجعها الخادم (لم يُحدَّد شكلها النهائي بعد):</p>
                  <details>
                    <summary>عرض النتيجة</summary>
                    <pre dir="ltr" style={{ maxHeight: 320, overflow: 'auto', textAlign: 'left' }}>
                      {JSON.stringify(poll.data.result, null, 2)}
                    </pre>
                  </details>
                </>
              )
            ) : (
              <p>الحالة: {statusLabel} — يتم التحديث تلقائيًا.</p>
            )}
          </section>
        )}

        <section className="live-overview-grid">
          <aside className="live-card live-detection">
            <header className="live-card-heading">
              <div>
                <ScanLine size={19} />
                <h2>رصد الكائنات اللحظي</h2>
              </div>
              <span className="live-online-dot" />
            </header>

            <div className="live-detection-row">
              <Users size={17} />
              <span>اللاعبون المرصودون</span>
              <b>22</b>
            </div>
            <div className="live-detection-row">
              <Grid2X2 size={17} />
              <span>فرق اللعب</span>
              <b>2</b>
            </div>
            <div className="live-detection-row">
              <Activity size={17} />
              <span>رصد وتتبع الكرة</span>
              <b className="live-good">تجريبي</b>
            </div>
            <div className="live-detection-row">
              <Maximize size={17} />
              <span>مطابقة الإحداثيات</span>
              <b>99.4%</b>
            </div>
            <div className="live-detection-row">
              <Fingerprint size={17} />
              <span>تعرف هوية اللاعب</span>
              <b>محاكاة</b>
            </div>

            <div className="live-validation-note">
              <ShieldCheck size={19} />
              <div>
                <b>حالة نظام الرصد</b>
                <p>القيم المعروضة توضيحية وتحتاج إلى نتائج فعلية من محرك التحليل.</p>
              </div>
            </div>
          </aside>

          <section className="live-card live-video-card">
            <header className="live-video-toolbar">
              <div className="live-video-tools">
                <span><ScanLine size={14} /> Homography 2D</span>
                <span><Gauge size={14} /> 58.4 FPS</span>
              </div>
              <div className="live-video-status">
                <span className="live-red-dot" />
                معاينة التحليل — Demo
              </div>
            </header>

            <div className="live-pitch">
              <div className="live-pitch-top-label">
                <span>RASED · Tactical Vision</span>
                <span>FRAME #{selectedFrame}</span>
              </div>

              <div className="live-pitch-center">
                <div className="live-pitch-circle" />
                <div className="live-pitch-line" />
                <div className="live-pitch-box live-pitch-box-left" />
                <div className="live-pitch-box live-pitch-box-right" />

                {[
                  ['p1', '15%', '25%', 'A'],
                  ['p2', '28%', '39%', 'A'],
                  ['p3', '35%', '65%', 'A'],
                  ['p4', '43%', '28%', 'A'],
                  ['p5', '48%', '48%', 'A'],
                  ['p6', '57%', '69%', 'B'],
                  ['p7', '65%', '35%', 'B'],
                  ['p8', '74%', '55%', 'B'],
                  ['p9', '82%', '28%', 'B'],
                  ['p10', '86%', '68%', 'B'],
                  ['p11', '53%', '20%', 'B'],
                ].map(([id, left, top, team], index) => (
                  <div
                    key={id}
                    className={`live-player-marker ${team === 'A' ? 'team-a' : 'team-b'}`}
                    style={{ left, top }}
                    title={`لاعب تجريبي ${index + 1}`}
                  >
                    {index + 1}
                  </div>
                ))}

                <div className="live-ball-marker" />
                <div className="live-ball-label">الكرة · موقع توضيحي</div>
                <div className="live-pitch-watermark">عرض ملعب توضيحي</div>
              </div>

              <div className="live-pitch-footer">
                <span><i className="team-a-dot" /> الفريق A</span>
                <span><i className="team-b-dot" /> الفريق B</span>
                <span>المواقع ليست مستخرجة من فيديو حقيقي</span>
              </div>
            </div>

            <div className="live-player-controls">
              <button
                type="button"
                aria-label={playing ? 'إيقاف المعاينة' : 'تشغيل المعاينة'}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <span>{playing ? 'المعاينة التجريبية تعمل' : 'المعاينة التجريبية متوقفة'}</span>
              <span className="live-frame-time">32:10.0</span>
            </div>

            <div className="live-video-caption">
              <b>معاينة التتبع التكتيكي</b>
              <span>عرض توضيحي — ليس بثًا مباشرًا</span>
            </div>
          </section>

          <aside className="live-card live-pipeline-card">
            <header className="live-card-heading">
              <div>
                <Cpu size={19} />
                <h2>مراحل خط المعالجة</h2>
              </div>
              <small>5 مراحل</small>
            </header>

            <div className="live-pipeline-list">
              {pipeline.map((item, index) => (
                <div className={`live-pipeline-item ${item.status}`} key={item.title}>
                  <div className="live-pipeline-icon">
                    {item.status === 'done' ? (
                      <Check size={15} />
                    ) : item.status === 'running' ? (
                      <Activity size={15} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </div>
                  <div className="live-pipeline-copy">
                    <b>{index + 1}. {item.title}</b>
                    <small>{item.detail}</small>
                    {item.status === 'running' && (
                      <div className="live-mini-track"><span /></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="live-pipeline-foot">
              <span>حالة العرض</span>
              <b>{live ? 'عرض توضيحي' : 'محاكاة محلية'}</b>
            </div>
          </aside>
        </section>

        <section className="live-card live-stats-card">
          <header className="live-card-heading live-stats-heading">
            <div>
              <BarChart3 size={19} />
              <h2>تحليل الفريمات ومعدل التقدم</h2>
            </div>
            <span className="live-demo-label">قيم تجريبية</span>
          </header>

          <div className="live-stats-grid">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <div className="live-stat" key={label}>
                <div className="live-stat-top">
                  <span>{label}</span>
                  <Icon size={18} />
                </div>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>

          <div className="live-total-progress">
            <div>
              <b>تقدم المعالجة الإجمالي</b>
              <strong>{progress}%</strong>
            </div>
            <div className="live-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>هذه النسبة ثابتة في النموذج التجريبي ولا تمثل تقدم API فعليًا.</small>
          </div>
        </section>

        <section className="live-card live-frames-card">
          <header className="live-card-heading">
            <div>
              <Video size={19} />
              <h2>سجل الفريمات المتتابعة</h2>
            </div>
            <span className="live-demo-label">Sequential Frame Stream · Demo</span>
          </header>

          <div className="live-frames-list">
            {demoFrames.map((frame) => (
              <button
                type="button"
                key={frame.number}
                className={`live-frame-item ${selectedFrame === frame.number ? 'selected' : ''}`}
                onClick={() => setSelectedFrame(frame.number)}
              >
                <div className="live-frame-thumbnail">
                  <span className="live-frame-play"><Play size={15} /></span>
                  <span className="live-frame-number">#{frame.number}</span>
                </div>
                <b>{frame.time}</b>
                <small>{frame.label}</small>
              </button>
            ))}
          </div>
        </section>

        <footer className="live-bottom-actions">
          <button
            type="button"
            className="live-secondary-button"
            onClick={() => setSimulation(!simulation)}
          >
            <Activity size={16} />
            {simulation ? 'وضع المحاكاة مفعّل' : 'تفعيل وضع المحاكاة'}
          </button>

          <button
            type="button"
            className="live-secondary-button"
            onClick={() => setShowLogs(!showLogs)}
          >
            <FileVideo size={16} />
            {showLogs ? 'إخفاء سجل الأحداث' : 'عرض سجل الأحداث'}
          </button>

          <button
            type="button"
            className="live-danger-button"
            onClick={() => {
              setPlaying(false)
              setShowLogs(false)
            }}
          >
            <XCircle size={16} />
            إيقاف المعاينة
          </button>
        </footer>

        {showLogs && (
          <section className="live-card live-logs">
            <h2><Radio size={18} /> سجل الأحداث التجريبي</h2>
            <p>لا توجد أحداث فعلية متصلة بالـ API حتى الآن.</p>
            <p>الفريم المحدد حاليًا: #{selectedFrame}</p>
          </section>
        )}

        <div className="live-disclaimer">
          <ShieldCheck size={17} />
          <span>
            {live
              ? 'حالة التحليل أعلاه حقيقية من الخادم؛ أما الفريمات ومواقع اللاعبين والإحصائيات في بقية اللوحات فلا تزال توضيحية.'
              : 'وضع العرض التجريبي: الأرقام والفريمات ومواقع اللاعبين توضيحية وليست نتائج تحليل مباراة فعلية.'}
          </span>
        </div>
      </main>
    </div>
  )
}
