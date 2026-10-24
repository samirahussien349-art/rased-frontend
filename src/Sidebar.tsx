import './Sidebar.css'

type SidebarProps = { active: 'performance' | 'upload' }

export default function Sidebar({ active }: SidebarProps) {
  const links = [
    { icon: '▦', label: 'نظرة عامة', href: '/performance' },
    { icon: '◎', label: 'تحليل المباريات', href: '/performance', key: 'performance' },
    { icon: '♟', label: 'ملفات اللاعبين', href: '/performance' },
    { icon: '♧', label: 'رفع مباراة جديدة', href: '/upload', key: 'upload', badge: 'جديد' },
    { icon: '▤', label: 'التقارير والتوصيات', href: '/performance' },
    { icon: '☷', label: 'إعدادات المنظومة', href: '/performance' },
  ]
  return <aside className={`sidebar ${active === 'upload' ? 'sidebar-upload' : ''}`} aria-label="التنقل الرئيسي">
    <div className="sidebar-top">
      <div className="sidebar-brand"><div><b>راصد RASED</b><small>منظومة التحليل الرياضي</small></div><span className="sidebar-logo">ر</span></div>
      <nav className="sidebar-nav"><div className="nav-heading">{active === 'upload' ? 'الوحدات التكتيكية' : 'التنقل التكتيكي'}</div>{links.map(link=><a href={link.href} key={link.label} className={`nav-link ${(link.key === active || (active === 'performance' && link.label === 'تحليل المباريات')) ? 'current' : ''}`}><span className="nav-icon">{link.icon}</span><span>{link.label}</span>{link.badge&&<small className="new-badge">{link.badge}</small>}</a>)}</nav>
    </div>
    <div className="sidebar-version"><b>إصدار المنظومة <span>v2.4 Pro</span></b><small><i/> محرك الذكاء الاصطناعي متصل</small><small className="version-name">v2.4 Pro Tactical</small></div>
  </aside>
}
