import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  Lightbulb, BookOpen, Zap, Star, Shield, TrendingUp
} from 'lucide-react';
import { getStockLesson, completeStockLesson } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';

function QuizQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setRevealed(true);
    onAnswer({ questionId: question.id, correct: selected === question.correctAnswer });
  };

  return (
    <div className="glass-card p-6 border border-white/10">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-violet-400 text-sm font-bold">?</span>
        </div>
        <p className="text-white font-medium leading-relaxed">{question.question}</p>
      </div>

      <div className="space-y-2 mb-4">
        {question.options?.map((opt) => {
          let style = 'border-white/10 bg-white/3 text-slate-300 hover:border-violet-500/40';
          if (revealed) {
            if (opt.id === question.correctAnswer) style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
            else if (opt.id === selected)          style = 'border-coral-500/50 bg-coral-500/10 text-coral-300';
          } else if (opt.id === selected) {
            style = 'border-violet-500/50 bg-violet-500/10 text-white';
          }
          return (
            <button key={opt.id} onClick={() => !revealed && setSelected(opt.id)} disabled={revealed}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${style}`}>
              <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {opt.id.toUpperCase()}
              </div>
              <span className="text-sm">{opt.text}</span>
              {revealed && opt.id === question.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
              {revealed && opt.id === selected && opt.id !== question.correctAnswer && <XCircle className="w-4 h-4 text-coral-400 ml-auto" />}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <button onClick={handleSubmit} disabled={!selected} className="btn-primary text-sm disabled:opacity-40">
          Submit Answer
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex gap-3 ${selected === question.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-coral-500/10 border-coral-500/20'}`}>
          {selected === question.correctAnswer
            ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            : <XCircle    className="w-5 h-5 text-coral-400 flex-shrink-0" />
          }
          <div>
            <div className={`font-semibold text-sm mb-1 ${selected === question.correctAnswer ? 'text-emerald-300' : 'text-coral-300'}`}>
              {selected === question.correctAnswer ? 'Correct!' : 'Not quite.'}
            </div>
            <div className="text-slate-400 text-sm leading-relaxed">{question.explanation}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function StockLessonPage() {
  const { lessonId } = useParams();
  const navigate     = useNavigate();
  const [lesson,     setLesson]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState(0); // 0=content 1=quiz 2=complete
  const [answers,    setAnswers]    = useState({});
  const [completing, setCompleting] = useState(false);
  const [result,     setResult]     = useState(null);

  useEffect(() => {
    getStockLesson(lessonId)
      .then((d) => setLesson(d.lesson))
      .catch(() => toast.error('Lesson not found'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return (
    <AppLayout>
      <div className="section-container py-12 text-center">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading lesson…</p>
      </div>
    </AppLayout>
  );

  if (!lesson) return (
    <AppLayout>
      <div className="section-container py-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h2 className="font-display font-bold text-2xl text-white mb-4">Lesson not found</h2>
        <Link to="/stock-academy" className="btn-primary">Back to Academy</Link>
      </div>
    </AppLayout>
  );

  const sections  = lesson.content?.sections || [];
  const questions = lesson.quiz || [];
  const hasQuiz   = questions.length > 0;

  const handleAnswer = (answer) => setAnswers((a) => ({ ...a, [answer.questionId]: answer }));
  const allAnswered   = questions.every((q) => answers[q.id]);
  const correct       = Object.values(answers).filter((a) => a.correct).length;
  const score         = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await completeStockLesson(lessonId, { score });
      setResult(res);
      setStep(2);
    } catch {
      toast.error('Failed to save progress. Check your connection.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="section-container py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/stock-academy" className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <div className="text-slate-500 text-xs mb-0.5">Stock Market Academy</div>
            <h1 className="font-display font-bold text-xl text-white">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 text-gold-400 text-sm font-semibold">
            <Zap className="w-4 h-4" />{lesson.xpReward} XP
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Lesson', ...(hasQuiz ? ['Quiz'] : []), 'Complete'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 text-sm ${step === i ? 'text-white' : step > i ? 'text-emerald-400' : 'text-slate-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                  step === i ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400' :
                               'bg-white/5 border border-white/10 text-slate-600'
                }`}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < (hasQuiz ? 2 : 1) && (
                <div className={`flex-1 h-px ${step > i ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Content */}
          {step === 0 && (
            <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {lesson.content?.intro && (
                <div className="glass-card border border-violet-500/20 p-5 mb-6 flex gap-3">
                  <BookOpen className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-relaxed">{lesson.content.intro}</p>
                </div>
              )}

              <div className="space-y-6 mb-8">
                {sections.map((section, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-card p-6">
                    <h3 className="font-display font-bold text-white mb-3">{section.title}</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{section.body}</p>
                    {section.tip && (
                      <div className="mt-4 flex gap-2 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
                        <Lightbulb className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gold-300/80 text-sm leading-relaxed">{section.tip}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {lesson.content?.keyTakeaways?.length > 0 && (
                <div className="glass-card border border-cyan-500/20 p-5 mb-8">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-cyan-400" /> Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {lesson.content.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-white/5 mb-6 text-xs text-slate-500">
                <Shield className="w-4 h-4 flex-shrink-0 text-violet-400/60" />
                All examples use fictional companies. Not financial advice.
              </div>

              <button onClick={() => setStep(hasQuiz ? 1 : 2)} className="btn-primary w-full justify-center">
                {hasQuiz ? 'Continue to Quiz' : 'Mark Complete'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Quiz */}
          {step === 1 && hasQuiz && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display font-bold text-xl text-white mb-2">Knowledge Check</h2>
              <p className="text-slate-400 text-sm mb-6">Answer all questions to complete this lesson.</p>

              <div className="space-y-6 mb-8">
                {questions.map((q, i) => (
                  <div key={q.id}>
                    <div className="text-slate-500 text-xs mb-2">Question {i+1} of {questions.length}</div>
                    <QuizQuestion question={q} onAnswer={handleAnswer} />
                  </div>
                ))}
              </div>

              <button onClick={handleComplete} disabled={!allAnswered || completing}
                className="btn-primary w-full justify-center disabled:opacity-50">
                {completing
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Complete Lesson <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </motion.div>
          )}

          {/* Complete */}
          {step === 2 && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </motion.div>

              <h2 className="font-display font-bold text-3xl text-white mb-2">Lesson Complete!</h2>
              <p className="text-slate-400 mb-6">{lesson.title}</p>

              <div className="flex justify-center gap-6 mb-8">
                {hasQuiz && (
                  <div>
                    <div className="font-display font-bold text-2xl text-white">{score}%</div>
                    <div className="text-slate-500 text-sm">Quiz Score</div>
                  </div>
                )}
                <div>
                  <div className="font-display font-bold text-2xl text-gold-400">+{result?.xpEarned ?? lesson.xpReward}</div>
                  <div className="text-slate-500 text-sm">XP Earned</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Link to="/stock-academy" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back to Academy</Link>
                <Link to="/trading" className="btn-primary"><TrendingUp className="w-4 h-4" /> Practice Trading</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
