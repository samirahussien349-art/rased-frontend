
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

type SidebarProps = {
  active: 'performance' | 'upload' | 'analysis'
}

export default function Sidebar({ active }: SidebarProps) {
  const links = [
    { icon: '▦', label: 'نظرة عامة', href: '/performance' },
    {
      icon: '◎',
      label: 'تحليل المباريات',
      href: '/performance',
      key: 'performance',
    },
    { icon: '♟', label: 'ملفات اللاعبين', href: '/performance' },
    {
      icon: '♧',
      label: 'رفع مباراة جديدة',
      href: '/upload',
      key: 'upload',
      badge: 'جديد',
    },
    { icon: '▤', label: 'التقارير والتوصيات', href: '/performance' },
    {
      icon: '◉',
      label: 'تحليل الفيديو المباشر',
      href: '/analysis',
      key: 'analysis',
    },
    { icon: '☷', label: 'إعدادات المنظومة', href: '/performance' },
  ]

  return (
    <aside
      className={`sidebar ${active === 'upload' ? 'sidebar-upload' : ''}`}
      aria-label="التنقل الرئيسي"
    >
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div>
            <b>راصد RASED</b>
            <small>منظومة التحليل الرياضي</small>
          </div>
          <span className="sidebar-logo">ر</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-heading">
            {active === 'upload' ? 'الوحدات التكتيكية' : 'التنقل التكتيكي'}
          </div>

          {links.map((link) => (
            <NavLink
              to={link.href}
              key={link.label}
              className={({ isActive }) =>
                `nav-link ${
                  isActive && (link.key ? link.key === active : true)
                    ? 'current'
                    : ''
                }`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && (
                <small className="new-badge">{link.badge}</small>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-version">
        <b>
          إصدار المنظومة <span>v2.4 Pro</span>
        </b>
        <small>
          <i /> محرك الذكاء الاصطناعي متصل
        </small>
        <small className="version-name">v2.4 Pro Tactical</small>
      </div>
    </aside>
  )
}
