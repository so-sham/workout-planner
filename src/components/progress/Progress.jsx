/**
 * @module components/progress/Progress
 * @description Progress dashboard showing weekly volume trends and
 * individual key-lift progression charts.
 *
 * @param {Object} props
 * @param {number} props.refreshCounter - Triggers data reload when incremented
 * @returns {JSX.Element}
 */
import { useState, useEffect } from 'react';
import { KEY_LIFTS } from '../../constants/exercises';
import { loadAllWorkouts, loadPRs } from '../../utils/storage';
import PRWall from './PRWall';
import LiftChart from './LiftChart';

export default function Progress({ refreshCounter }) {
  const [workouts, setWorkouts] = useState([]);
  const [prs, setPRs] = useState({});

  /** Reload workout and PR data when refresh counter changes */
  useEffect(() => {
    setWorkouts(loadAllWorkouts());
    setPRs(loadPRs());
  }, [refreshCounter]);

  return (
    <section className="space-y-6">
      <PRWall workouts={workouts} />
      <div className="space-y-4">
        <h2 className="display text-2xl text-white">Key Lifts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {KEY_LIFTS.map((lift) => (
            <LiftChart key={lift} lift={lift} workouts={workouts} pr={prs[lift]} />
          ))}
        </div>
      </div>
    </section>
  );
}
