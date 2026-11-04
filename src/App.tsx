import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './ui/components/AppLayout';
import Azan from './ui/components/Azan';
import ClockCheck from './ui/components/ClockCheck';
import ToastHost from './ui/components/Toast';
import { seedIfEmpty } from './data/seed';
import { useAuth } from './hooks/useAuth';
import { useSyncState } from './hooks/useSyncState';
import Backup from './screens/Backup';
import Boot from './screens/Boot';
import Calendar from './screens/Calendar';
import Day from './screens/Day';
import Domains from './screens/Domains';
import Habits from './screens/Habits';
import Holidays from './screens/Holidays';
import Login from './screens/Login';
import More from './screens/More';
import Settings from './screens/Settings';
import Streak from './screens/Streak';
import Styleguide from './screens/Styleguide';
import Tasks from './screens/Tasks';

function App() {
  const { user, loading } = useAuth();
  const sync = useSyncState(user?.uid ?? null);

  useEffect(() => {
    if (user) seedIfEmpty(user.uid);
  }, [user]);

  return (
    <HashRouter>
      <ToastHost />
      <ClockCheck />
      <Azan />
      {loading ? (
        <Boot />
      ) : !user ? (
        <Login />
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout title="Today" sync={sync}>
                <Day />
              </AppLayout>
            }
          />
          <Route
            path="/day/:dateKey"
            element={
              <AppLayout title="Day" sync={sync}>
                <Day />
              </AppLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <AppLayout title="Calendar" sync={sync}>
                <Calendar />
              </AppLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <AppLayout title="Tasks" sync={sync}>
                <Tasks />
              </AppLayout>
            }
          />
          <Route
            path="/more"
            element={
              <AppLayout title="More" sync={sync}>
                <More />
              </AppLayout>
            }
          />
          <Route
            path="/more/settings"
            element={
              <AppLayout title="Settings" sync={sync}>
                <Settings />
              </AppLayout>
            }
          />
          <Route
            path="/more/habits"
            element={
              <AppLayout title="Habits" sync={sync}>
                <Habits />
              </AppLayout>
            }
          />
          <Route
            path="/more/domains"
            element={
              <AppLayout title="Domains" sync={sync}>
                <Domains />
              </AppLayout>
            }
          />
          <Route
            path="/more/holidays"
            element={
              <AppLayout title="Holidays" sync={sync}>
                <Holidays />
              </AppLayout>
            }
          />
          <Route
            path="/more/streak"
            element={
              <AppLayout title="Streak" sync={sync}>
                <Streak />
              </AppLayout>
            }
          />
          <Route
            path="/more/backup"
            element={
              <AppLayout title="Backup" sync={sync}>
                <Backup />
              </AppLayout>
            }
          />
          <Route path="/styleguide" element={<Styleguide />} />
        </Routes>
      )}
    </HashRouter>
  );
}

export default App;
