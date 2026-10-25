import './Sidebar.css'

type SidebarProps = { active: 'upload' }

export default function Sidebar({ active }: SidebarProps) {
  const links = [
    { icon: '♧', label: 'رفع مباراة جديدة', href: '/', key: 'upload' },
  ]
  return <aside className={`sidebar ${active === 'upload' ? 'sidebar-upload' : ''}`} aria-label="التنقل الرئيسي">
    <div className="sidebar-top">
      <div className="sidebar-brand"><div><b>راصد RASED</b><small>منظومة التحليل الرياضي</small></div><span className="sidebar-logo">ر</span></div>
      <nav className="sidebar-nav"><div className="nav-heading">الوحدات التكتيكية</div>{links.map(link=><a href={link.href} key={link.label} className={`nav-link ${link.key === active ? 'current' : ''}`}><span className="nav-icon">{link.icon}</span><span>{link.label}</span></a>)}</nav>
    </div>
    <div className="sidebar-version"><b>تحليل الفيديو</b><small>تُرسل البيانات إلى الخادم عند بدء الرفع.</small></div>
  </aside>
}
