import { NavLink } from 'react-router-dom';
import { signOut } from '../data/auth';
import { useAuth } from '../hooks/useAuth';
import { useDomains } from '../hooks/useDomains';
import '../styles/dm-more.css';

const COLORS = ['dm-c-sky', 'dm-c-peach', 'dm-c-mint', 'dm-c-rose', 'dm-c-amber', 'dm-c-lilac'];

const ITEMS = [
  { to: '/more/settings', label: 'Settings', desc: 'Theme, prayer offsets and azan' },
  { to: '/more/habits', label: 'Habits', desc: 'Daily goals and schedules' },
  { to: '/more/domains', label: 'Domains', desc: 'Categories and colors' },
  { to: '/more/holidays', label: 'Holidays', desc: 'College days off' },
  { to: '/more/streak', label: 'Streak', desc: 'Counter, urges and history' },
  { to: '/more/backup', label: 'Backup', desc: 'Export and import data' },
];

function domainColor(index: number): string {
  const colors = ['#FFB08A', '#8FD3C1', '#FF8FA3', '#C9CBF5', '#FFC83D', '#DDE2EE'];
  return colors[index % 6];
}

export default function More() {
  const { user } = useAuth();
  const domains = useDomains(user?.uid ?? null);

  return (
    <div className="dm-page">
      <div className="dm-grid">
        {ITEMS.map((item, idx) => (
          <NavLink key={item.to} to={item.to} className={`dm-menu ${COLORS[idx % COLORS.length]}`}>
            <b>{item.label}</b>
            <span>{item.desc}</span>
          </NavLink>
        ))}
      </div>
      <button className="dm-btn" onClick={() => void signOut()} type="button">
        Sign out
      </button>
      <h2 className="dm-rt">Your domains</h2>
      <div className="dm-chips">
        {domains.map((domain, idx) => (
          <span key={domain.id} className="dm-chip">
            <i style={{ background: domainColor(idx) }}></i>
            {domain.name}
          </span>
        ))}
      </div>
    </div>
  );
}
