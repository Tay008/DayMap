import type { ReactNode } from 'react';
import type { BlockView, TodayView } from '../../lib/todayView';
import DayStrip from '../charts/DayStrip';
import Ring from '../charts/Ring';
import { percent as pct } from '../../lib/stats';
import '../../styles/dm-today.css';

function toneOf(block: BlockView): 'fx' | 'dawn' | 'day' | 'eve' | 'nt' {
  return block.kind === 'fixed' ? 'fx' : block.color;
}

interface TodayScreenProps {
  view: TodayView;
  onPrev: () => void;
  onNext: () => void;
  controls: ReactNode;
  renderRoomBody: (roomId: string) => ReactNode;
  unplaced: ReactNode;
  rightColumn: ReactNode;
  progressDone?: number;
  progressPlanned?: number;
}

function IconLeft() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRight() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TodayScreen({
  view,
  onPrev,
  onNext,
  controls,
  renderRoomBody,
  unplaced,
  rightColumn,
  progressDone = 0,
  progressPlanned = 0,
}: TodayScreenProps) {
  return (
    <div className="dm-page">
      <div className="dm-main">
        <header className="dm-hd">
          <div>
            <h1 className="dm-h1">{view.weekday}</h1>
            <div className="dm-date">{view.dateLabel}, {view.hijriLabel}</div>
          </div>
          <div className="dm-ctl">
            {controls}
            <button className="dm-btn dm-sq" aria-label="Previous day" onClick={onPrev} type="button">
              <IconLeft />
            </button>
            <button className="dm-btn dm-sq" aria-label="Next day" onClick={onNext} type="button">
              <IconRight />
            </button>
          </div>
        </header>
        <section className="dm-pr">
          {view.prayers.map((p) => (
            <div key={p.key} className={`dm-pz${p.isNext ? ' dm-on' : ''}`}>
              <b>
                {p.label}
                <strong lang="ur" dir="rtl" className="dm-ur">
                  {p.urdu}
                </strong>
              </b>
              <span>{p.timeLabel}</span>
              {p.untilLabel ? <em>in {p.untilLabel}</em> : null}
            </div>
          ))}
        </section>
        <section className="dm-card dm-rc">
          <h3 className="dm-rt">Your day</h3>
          <DayStrip
            blocks={view.blocks.map((b) => ({
              id: b.id,
              name: b.name,
              startMin: b.startMin,
              endMin: b.endMin,
              tone: toneOf(b),
            }))}
            prayers={view.prayerMarks}
            nowMin={view.nowMin}
          />
        </section>
        <div className="dm-cols">
          <div className="dm-left">
            {view.hero ? (
              <section className="dm-card dm-hero">
                <div>
                  <span className="dm-pill">Now</span>
                  <h2 className="dm-h2">{view.hero.name}</h2>
                  <p className="dm-sub">{view.hero.rangeLabel}</p>
                </div>
                <div>
                  <div className="dm-big">{view.hero.remainingLabel}</div>
                  <p className="dm-sub dm-r">until {view.hero.name} ends</p>
                </div>
                <div className="dm-bar dm-wide">
                  <i style={{ width: `${view.hero.percent}%` }}></i>
                </div>
              </section>
            ) : null}
            <section className="dm-tl">
              {view.blocks.map((block) => {
                if (block.kind === 'fixed') {
                  if (block.isNow) {
                    return (
                      <div key={block.id} className="dm-row">
                        <div className="dm-t">{block.startLabel}</div>
                        <div className="dm-blk dm-nowrow dm-top">
                          <b>{block.name}</b>
                          <span>
                            <span className="dm-pill">Now</span> to {block.endLabel}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={block.id} className="dm-row">
                      <div className="dm-t">{block.startLabel}</div>
                      <div className="dm-blk dm-fx dm-top">
                        <b>{block.name}</b>
                        <span>to {block.endLabel}</span>
                      </div>
                    </div>
                  );
                }
                if (block.kind === 'room') {
                  if (!block.hasTasks && block.isPast) {
                    return (
                      <div key={block.id} className="dm-row">
                        <div className="dm-t">{block.startLabel}</div>
                        <div className={`dm-blk dm-${block.color} dm-top`}>
                          <b>{block.name}, passed with nothing planned</b>
                          <span>to {block.endLabel}</span>
                        </div>
                      </div>
                    );
                  }
                  if (!block.hasTasks) {
                    return (
                      <div key={block.id} className="dm-row">
                        <div className="dm-t">{block.startLabel}</div>
                        <div className={`dm-blk dm-${block.color} dm-top`}>
                          <b>{block.name}</b>
                          <span>to {block.endLabel}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={block.id} className="dm-row">
                      <div className="dm-t">{block.startLabel}</div>
                      <div className={`dm-blk dm-${block.color}`}>
                        <div className="dm-top">
                          <h3 className="dm-rt">{block.name}</h3>
                          <span>to {block.endLabel}</span>
                        </div>
                        {renderRoomBody(block.id)}
                        <div>
                          <button className="dm-btn" type="button">
                            <IconPlus /> Add task
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </section>
            {unplaced}
          </div>
          <aside className="dm-right">
            {(progressPlanned > 0 || progressDone > 0) ? (
              <section className="dm-card dm-rc">
                <h3 className="dm-rt">Progress</h3>
                <div className="dm-prow">
                  <Ring percent={pct(progressDone, progressPlanned)} label={`${progressDone} of ${progressPlanned} done`} />
                  <p className="dm-sub">{progressDone} of {progressPlanned} done</p>
                </div>
              </section>
            ) : null}
            {rightColumn}
          </aside>
        </div>
      </div>
    </div>
  );
}
