// import { useTranslation } from '@/i18n/I18nContext';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { httpClient } from '@/shared/api/httpClient';
import { useDailyMenuData } from '@/modules/daily-menu/hooks/useDailyMenuData';
import type { CatalogProduct } from '@/types/catalog';
import type { DailyMenuException, DailyMenuSchedule } from '@/types/dailyMenu';
import './DailyMenuPage.css';

type FeedbackState =
  | {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }
  | null;

type SavingState = {
  today: boolean;
  deactivate: boolean;
  schedule: boolean;
  exception: boolean;
};

const DEFAULT_DISCOUNT = '10.00';
const soupMatchers = [/ciorb/i, /soup/i];
const mainMatchers = [/fel principal/i, /main/i];

const formatCurrency = (value: number) => `${value.toFixed(2)} RON`;
const safeNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};
const parseInputNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatDateRange = (start: string, end: string) => `${formatDate(start)} -> ${formatDate(end)}`;
const matchesCategory = (product: CatalogProduct, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(product.category ?? ''));
const getProductLabel = (product?: CatalogProduct | null) => product?.name ?? 'Produs indisponibil';

export const DailyMenuPage = () => {
  //   const { t } = useTranslation();
  const {
    products,
    currentMenu,
    schedules,
    exceptions,
    loading,
    errors,
    refreshProducts,
    refreshCurrentMenu,
    refreshSchedules,
    refreshExceptions,
  } = useDailyMenuData();

  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'exceptions'>('today');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [saving, setSaving] = useState<SavingState>({ today: false, deactivate: false, schedule: false, exception: false });
  const [todayForm, setTodayForm] = useState({ soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
  const [scheduleForm, setScheduleForm] = useState({
    startDate: '',
    endDate: '',
    soupId: '',
    mainCourseId: '',
    discount: DEFAULT_DISCOUNT,
  });
  const [exceptionForm, setExceptionForm] = useState({ date: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
  const [pendingCancelScheduleId, setPendingCancelScheduleId] = useState<number | null>(null);
  const [pendingCancelExceptionId, setPendingCancelExceptionId] = useState<number | null>(null);

  useEffect(() => {
    if (currentMenu) {
      setTodayForm({
        soupId: currentMenu.soup?.id ? String(currentMenu.soup.id) : '',
        mainCourseId: currentMenu.mainCourse?.id ? String(currentMenu.mainCourse.id) : '',
        discount: Number.isFinite(currentMenu.discount)
          ? currentMenu.discount.toFixed(2)
          : DEFAULT_DISCOUNT,
      });
    }
  }, [currentMenu]);

  const categorizedProducts = useMemo(() => {
    if (!products.length) {
      return { soups: [] as CatalogProduct[], mains: [] as CatalogProduct[] };
    }
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    const soups = sorted.filter((product) => matchesCategory(product, soupMatchers));
    const mains = sorted.filter((product) => matchesCategory(product, mainMatchers));
    return {
      soups: soups.length ? soups : sorted,
      mains: mains.length ? mains : sorted,
    };
  }, [products]);

  const soups = categorizedProducts.soups;
  const mains = categorizedProducts.mains;

  const scheduleChartData = useMemo(() => {
    if (!schedules.length) {
      return [{ label: 'Fara programari', value: 0 }];
    }
    return schedules.slice(0, 6).map((schedule) => {
      const soupPrice = safeNumber(schedule.soup_price);
      const mainPrice = safeNumber(schedule.main_course_price);
      const discount = safeNumber(schedule.discount);
      return {
        label: formatDateRange(schedule.start_date, schedule.end_date),
        value: Number((soupPrice + mainPrice - discount).toFixed(2)),
      };
    });
  }, [schedules]);

  const donutDataset = useMemo(() => {
    if (!schedules.length && !exceptions.length) {
      return {
        chart: [{ name: 'Fara date', value: 100, color: '#94a3b8' }],
        legend: [{ name: 'Fara date', value: 100, color: '#94a3b8', raw: 0 }],
      };
    }
    const total = schedules.length + exceptions.length;
    const makeEntry = (name: string, count: number, color: string) => ({
      name,
      value: Number(((count / total) * 100).toFixed(1)),
      color,
      raw: count,
    });
    const entries = [
      makeEntry('Programari', schedules.length, '#0ea5e9'),
      makeEntry('Exceptii', exceptions.length, '#f97316'),
    ];
    return {
      chart: entries.map(({ raw, ...rest }) => rest),
      legend: entries,
    };
  }, [schedules.length, exceptions.length]);

  const activeMenuValue = currentMenu
    ? safeNumber(currentMenu.soup?.price) + safeNumber(currentMenu.mainCourse?.price) - safeNumber(currentMenu.discount)
    : 0;

  const isPageReady = !loading.products && !loading.current;

  const refreshAll = useCallback(() => {
    void refreshProducts();
    void refreshCurrentMenu();
    void refreshSchedules();
    void refreshExceptions();
  }, [refreshProducts, refreshCurrentMenu, refreshSchedules, refreshExceptions]);

  const showFeedback = (state: FeedbackState) => setFeedback(state);

  const handleTodaySubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!todayForm.soupId || !todayForm.mainCourseId) {
        showFeedback({ type: 'warning', message: 'Selecteaza atat ciorba, cat si felul principal.' });
        return;
      }
      setSaving((prev) => ({ ...prev, today: true }));
      try {
        await httpClient.post('/api/admin/daily-menu', {
          soupId: Number(todayForm.soupId),
          mainCourseId: Number(todayForm.mainCourseId),
          discount: parseInputNumber(todayForm.discount),
        });
        showFeedback({ type: 'success', message: 'Meniul zilei a fost salvat.' });
        await refreshCurrentMenu();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nu am putut salva meniul zilei.';
        showFeedback({ type: 'error', message });
      } finally {
        setSaving((prev) => ({ ...prev, today: false }));
      }
    },
    [todayForm, refreshCurrentMenu],
  );

  const handleDeactivate = useCallback(async () => {
    if (!currentMenu) {
      showFeedback({ type: 'info', message: 'Nu exista un meniu activ de dezactivat.' });
      return;
    }
    if (!window.confirm('Sigur dezactivezi meniul zilei pentru astazi?')) {
      return;
    }
    setSaving((prev) => ({ ...prev, deactivate: true }));
    try {
      await httpClient.delete('/api/admin/daily-menu');
      showFeedback({ type: 'success', message: 'Meniul zilei a fost dezactivat.' });
      await refreshCurrentMenu();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nu am putut dezactiva meniul zilei.';
      showFeedback({ type: 'error', message });
    } finally {
      setSaving((prev) => ({ ...prev, deactivate: false }));
    }
  }, [currentMenu, refreshCurrentMenu]);

  const handleScheduleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!scheduleForm.startDate || !scheduleForm.endDate || !scheduleForm.soupId || !scheduleForm.mainCourseId) {
        showFeedback({ type: 'warning', message: 'Completeaza toate campurile pentru programare.' });
        return;
      }
      if (new Date(scheduleForm.startDate) > new Date(scheduleForm.endDate)) {
        showFeedback({ type: 'warning', message: 'Data de inceput trebuie sa fie inainte de data de sfarsit.' });
        return;
      }
      setSaving((prev) => ({ ...prev, schedule: true }));
      try {
        await httpClient.post('/api/admin/daily-menu/schedule', {
          startDate: scheduleForm.startDate,
          endDate: scheduleForm.endDate,
          soupId: Number(scheduleForm.soupId),
          mainCourseId: Number(scheduleForm.mainCourseId),
          discount: parseInputNumber(scheduleForm.discount),
        });
        showFeedback({ type: 'success', message: 'Programarea a fost creata.' });
        setScheduleForm({ startDate: '', endDate: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
        await refreshSchedules();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nu am putut crea programarea.';
        showFeedback({ type: 'error', message });
      } finally {
        setSaving((prev) => ({ ...prev, schedule: false }));
      }
    },
    [scheduleForm, refreshSchedules],
  );

  const handleExceptionSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!exceptionForm.date || !exceptionForm.soupId || !exceptionForm.mainCourseId) {
        showFeedback({ type: 'warning', message: 'Completeaza toate campurile pentru exceptie.' });
        return;
      }
      setSaving((prev) => ({ ...prev, exception: true }));
      try {
        await httpClient.post('/api/admin/daily-menu/exception', {
          date: exceptionForm.date,
          soupId: Number(exceptionForm.soupId),
          mainCourseId: Number(exceptionForm.mainCourseId),
          discount: parseInputNumber(exceptionForm.discount),
        });
        showFeedback({ type: 'success', message: 'Exceptia a fost creata.' });
        setExceptionForm({ date: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
        await refreshExceptions();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nu am putut crea exceptia.';
        showFeedback({ type: 'error', message });
      } finally {
        setSaving((prev) => ({ ...prev, exception: false }));
      }
    },
    [exceptionForm, refreshExceptions],
  );

  const handleCancelSchedule = useCallback(
    async (scheduleId: number) => {
      if (!window.confirm('Anulezi aceasta programare?')) {
        return;
      }
      setPendingCancelScheduleId(scheduleId);
      try {
        await httpClient.delete(`/api/admin/daily-menu/schedule/${scheduleId}`);
        showFeedback({ type: 'success', message: 'Programarea a fost anulata.' });
        await refreshSchedules();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nu am putut anula programarea.';
        showFeedback({ type: 'error', message });
      } finally {
        setPendingCancelScheduleId(null);
      }
    },
    [refreshSchedules],
  );

  const handleCancelException = useCallback(
    async (exceptionId: number) => {
      if (!window.confirm('Anulezi aceasta exceptie?')) {
        return;
      }
      setPendingCancelExceptionId(exceptionId);
      try {
        await httpClient.delete(`/api/admin/daily-menu/exception/${exceptionId}`);
        showFeedback({ type: 'success', message: 'Exceptia a fost anulata.' });
        await refreshExceptions();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Eroare necunoscută';
        showFeedback({ type: 'error', message });
      } finally {
        setPendingCancelExceptionId(null);
      }
    },
    [refreshExceptions, showFeedback]
  );

  return (
    <div className="daily-menu-page" data-page-ready={isPageReady}>
      <PageHeader
        title='daily menu & oferte'
        description="Gestionează meniul zilei, programări automate și excepții pentru oferte speciale"
        actions={[
          {
            label: '↻ Reîmprospătează',
            variant: 'secondary',
            onClick: refreshAll,
          },
        ]}
      />

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} /> : null}

      {errors.products ? <InlineAlert type="error" message={errors.products} /> : null}
      {errors.current ? <InlineAlert type="error" message={errors.current} /> : null}
      {errors.schedules ? <InlineAlert type="error" message={errors.schedules} /> : null}
      {errors.exceptions ? <InlineAlert type="error" message={errors.exceptions} /> : null}

      <div className="daily-menu-hero">
        <div className="daily-menu-hero__stats">
          <StatCard
            title='daily-menu.meniul_activ_astazi'
            value={currentMenu ? formatCurrency(activeMenuValue) : 'Nu este setat'}
            helper={
              currentMenu
                ? `${getProductLabel(currentMenu.soup)} + ${getProductLabel(currentMenu.mainCourse)}`
                : 'Selectează ciorba și felul principal'
            }
          />
          <StatCard
            title='daily-menu.programari_active'
            value={String(schedules.length)}
            helper={`${exceptions.length} excepții definite`}
          />
          <StatCard
            title="Produse disponibile"
            value={String(products.length)}
            helper={`${soups.length} ciorbe, ${mains.length} feluri principale`}
          />
        </div>

        <div className="daily-menu-toolbar">
          <div className="daily-menu-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: activeTab === 'today' ? '#0ea5e9' : 'white',
                color: activeTab === 'today' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: activeTab === 'today' ? 600 : 500,
              }}
            >Astăzi</button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: activeTab === 'calendar' ? '#0ea5e9' : 'white',
                color: activeTab === 'calendar' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: activeTab === 'calendar' ? 600 : 500,
              }}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exceptions')}
              className={`tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: activeTab === 'exceptions' ? '#0ea5e9' : 'white',
                color: activeTab === 'exceptions' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: activeTab === 'exceptions' ? 600 : 500,
              }}
            >Excepții</button>
          </div>
        </div>
      </div>

      {/* Tab Astăzi */}
      {activeTab === 'today' && (
        <div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="daily-menu-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>'daily-menu.meniul_zilei_pentru_astazi'</h3>
            <form id="today-form" onSubmit={handleTodaySubmit} className="daily-menu-editor__row">
              <label>
                Alege Ciorba:
                <select
                  value={todayForm.soupId}
                  onChange={(e) => setTodayForm((prev) => ({ ...prev, soupId: e.target.value }))}
                  disabled={loading.products || saving.today}
                >
                  <option value="">-- Selectează ciorba --</option>
                  {soups.map((soup) => (
                    <option key={soup.id} value={String(soup.id)}>
                      {soup.name} ({formatCurrency(soup.price ?? 0)})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Alege Felul Principal:
                <select
                  value={todayForm.mainCourseId}
                  onChange={(e) => setTodayForm((prev) => ({ ...prev, mainCourseId: e.target.value }))}
                  disabled={loading.products || saving.today}
                >
                  <option value="">-- Selectează felul principal --</option>
                  {mains.map((main) => (
                    <option key={main.id} value={String(main.id)}>
                      {main.name} ({formatCurrency(main.price ?? 0)})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={todayForm.discount}
                  onChange={(e) => setTodayForm((prev) => ({ ...prev, discount: e.target.value }))}
                  disabled={saving.today}
                />
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="today-form" disabled={saving.today || loading.products}>
                {saving.today ? 'Se salvează...' : '💾 Salvează Meniul'}
              </button>
              {currentMenu && (
                <button type="button" onClick={handleDeactivate} disabled={saving.deactivate}>
                  {saving.deactivate ? 'Se dezactivează...' : '❌ Dezactivează'}
                </button>
              )}
            </div>
          </div>

          {currentMenu && (
            <div
              className="daily-menu-card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #d1fae5',
                background: '#f0fdf4',
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#059669' }}>✓ Meniu activ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong>Ciorba:</strong> {getProductLabel(currentMenu.soup)} -' '
                  {formatCurrency(safeNumber(currentMenu.soup?.price))}
                </div>
                <div>
                  <strong>Fel principal:</strong> {getProductLabel(currentMenu.mainCourse)} -' '
                  {formatCurrency(safeNumber(currentMenu.mainCourse?.price))}
                </div>
                <div>
                  <strong>Reducere:</strong> {formatCurrency(safeNumber(currentMenu.discount))}
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #bbf7d0' }}>
                  <strong>'daily-menu.pret_total'</strong> {formatCurrency(activeMenuValue)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Calendar */}
      {activeTab === 'calendar' && (
        <div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="daily-menu-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Programare Meniu (Interval)
            </h3>
            <form id="schedule-form" onSubmit={handleScheduleSubmit} className="daily-menu-editor__row">
              <label>
                Data început:
                <input
                  type="date"
                  value={scheduleForm.startDate}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  disabled={saving.schedule}
                  required
                />
              </label>
              <label>'daily-menu.data_sfarsit'<input
                type="date"
                value={scheduleForm.endDate}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, endDate: e.target.value }))}
                disabled={saving.schedule}
                required
              />
              </label>
              <label>
                Ciorba:
                <select
                  value={scheduleForm.soupId}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, soupId: e.target.value }))}
                  disabled={loading.products || saving.schedule}
                  required
                >
                  <option value="">-- Selectează --</option>
                  {soups.map((soup) => (
                    <option key={soup.id} value={String(soup.id)}>
                      {soup.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fel principal:
                <select
                  value={scheduleForm.mainCourseId}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, mainCourseId: e.target.value }))}
                  disabled={loading.products || saving.schedule}
                  required
                >
                  <option value="">-- Selectează --</option>
                  {mains.map((main) => (
                    <option key={main.id} value={String(main.id)}>
                      {main.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={scheduleForm.discount}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, discount: e.target.value }))}
                  disabled={saving.schedule}
                />
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="schedule-form" disabled={saving.schedule || loading.products}>
                {saving.schedule ? 'Se salvează...' : '📅 Creează Programare'}
              </button>
            </div>
          </div>

          {schedules.length > 0 ? (
            <div
              className="daily-menu-card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: 'white',
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>'daily-menu.programari_active'</h4>
              <ul className="daily-menu-placeholder">
                {schedules.map((schedule) => (
                  <li key={schedule.id}>
                    <div>
                      <strong>{formatDateRange(schedule.start_date, schedule.end_date)}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Reducere: {formatCurrency(safeNumber(schedule.discount))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancelSchedule(schedule.id)}
                      disabled={pendingCancelScheduleId === schedule.id}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {pendingCancelScheduleId === schedule.id ? 'Se anulează...' : 'Anulează'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="daily-menu-empty" style={{ padding: '2rem', textAlign: 'center' }}>Nu există programări active</div>
          )}

          {schedules.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Programări (grafic)</h4>
                <MiniBarChart data={scheduleChartData} />
              </div>
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Distribuție</h4>
                <MiniDonutChart data={donutDataset.chart} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Excepții */}
      {activeTab === 'exceptions' && (
        <div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="daily-menu-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>'daily-menu.exceptie_pentru_o_zi_specifica'</h3>
            <form id="exception-form" onSubmit={handleExceptionSubmit} className="daily-menu-editor__row">
              <label>
                Data:
                <input
                  type="date"
                  value={exceptionForm.date}
                  onChange={(e) => setExceptionForm((prev) => ({ ...prev, date: e.target.value }))}
                  disabled={saving.exception}
                  required
                />
              </label>
              <label>
                Ciorba:
                <select
                  value={exceptionForm.soupId}
                  onChange={(e) => setExceptionForm((prev) => ({ ...prev, soupId: e.target.value }))}
                  disabled={loading.products || saving.exception}
                  required
                >
                  <option value="">-- Selectează --</option>
                  {soups.map((soup) => (
                    <option key={soup.id} value={String(soup.id)}>
                      {soup.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fel principal:
                <select
                  value={exceptionForm.mainCourseId}
                  onChange={(e) => setExceptionForm((prev) => ({ ...prev, mainCourseId: e.target.value }))}
                  disabled={loading.products || saving.exception}
                  required
                >
                  <option value="">-- Selectează --</option>
                  {mains.map((main) => (
                    <option key={main.id} value={String(main.id)}>
                      {main.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={exceptionForm.discount}
                  onChange={(e) => setExceptionForm((prev) => ({ ...prev, discount: e.target.value }))}
                  disabled={saving.exception}
                />
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="exception-form" disabled={saving.exception || loading.products}>
                {saving.exception ? 'Se salvează...' : '➕ Creează Excepție'}
              </button>
            </div>
          </div>

          {exceptions.length > 0 ? (
            <div
              className="daily-menu-card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: 'white',
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>'daily-menu.exceptii_definite'</h4>
              <ul className="daily-menu-placeholder">
                {exceptions.map((exception) => (
                  <li key={exception.id}>
                    <div>
                      <strong>{formatDate(exception.date)}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Reducere: {formatCurrency(safeNumber(exception.discount))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancelException(exception.id)}
                      disabled={pendingCancelExceptionId === exception.id}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {pendingCancelExceptionId === exception.id ? 'Se anulează...' : 'Anulează'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="daily-menu-empty" style={{ padding: '2rem', textAlign: 'center' }}>'daily-menu.nu_exista_exceptii_definite'</div>
          )}
        </div>
      )}
    </div>
  );
};



