import { NavLink } from 'react-router-dom';
import { signOut } from '../data/auth';
import { useAuth } from '../hooks/useAuth';
import { useDomains } from '../hooks/useDomains';
import Button from '../ui/components/Button';
import './More.css';

const LINKS = [
  { to: '/more/settings', label: 'Settings' },
  { to: '/more/habits', label: 'Habits' },
  { to: '/more/domains', label: 'Domains' },
  { to: '/more/holidays', label: 'Holidays' },
  { to: '/more/streak', label: 'Streak' },
  { to: '/more/backup', label: 'Backup' },
];

// Temporary (Step 4): the domain names read from Firestore stay visible until the real
// Domains screen exists, so sync can still be checked at a glance.
export default function More() {
  const { user } = useAuth();
  const domains = useDomains(user?.uid ?? null);

  return (
    <div>
      <nav className="more__links">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="more__link">
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="more__top">
        <p className="more__count">Domains ({domains.length})</p>
        <Button variant="secondary" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
      <ul className="more__list">
        {domains.map((domain) => (
          <li key={domain.id} className="more__item">
            {domain.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
