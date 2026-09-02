import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';

// Each toast lives this long before it fades itself out. Later toasts in the
// same batch get a small extra grace period so they are not all racing.
const AUTO_DISMISS_MS = 12000;
const STAGGER_MS = 1500;

/**
 * Transient overlay for agentic tariff lookups.
 *
 * The backend no longer writes these results to output.json -- it returns
 * them in the /api/search-news response, and they are only ever shown here.
 * Calls onAllDismissed once the last toast of a batch is gone.
 */
const TariffNotifications = ({ lookups, onAllDismissed }) => {
    const { t } = useLanguage();
    const [toasts, setToasts] = useState([]);
    const hadToasts = useRef(false);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Re-seed (and re-arm the timers) whenever a new batch arrives.
    useEffect(() => {
        const batch = (lookups || []).map((lookup, index) => ({
            id: `${lookup.timestamp || 'tariff'}-${index}`,
            lifetime: AUTO_DISMISS_MS + index * STAGGER_MS,
            lookup
        }));

        setToasts(batch);

        const timers = batch.map((toast) =>
            setTimeout(() => dismiss(toast.id), toast.lifetime)
        );

        return () => timers.forEach(clearTimeout);
    }, [lookups, dismiss]);

    useEffect(() => {
        if (toasts.length) {
            hadToasts.current = true;
        } else if (hadToasts.current) {
            hadToasts.current = false;
            if (onAllDismissed) onAllDismissed();
        }
    }, [toasts, onAllDismissed]);

    if (!toasts.length) return null;

    return (
        <div className="tariff-toasts" role="status" aria-live="polite">
            {toasts.map(({ id, lifetime, lookup }) => (
                <div className={`tariff-toast tariff-toast-${lookup.status || 'ok'}`} key={id}>
                    <div className="tariff-toast-head">
                        <span className="tariff-toast-badge">{t('tariffLookup')}</span>
                        <button
                            type="button"
                            className="tariff-toast-close"
                            onClick={() => dismiss(id)}
                            aria-label={t('dismiss')}
                        >
                            &times;
                        </button>
                    </div>

                    <div className="tariff-toast-keyword">{lookup.keyword}</div>
                    <div className="tariff-toast-article">{lookup.article_title}</div>

                    {lookup.records && lookup.records.length > 0 ? (
                        <ul className="tariff-toast-records">
                            {lookup.records.map((record, index) => (
                                <li key={index}>
                                    <span className="tariff-toast-desc">{record.description}</span>
                                    <span className="tariff-toast-rate">
                                        {t('generalDuty')} {record.general_rate}
                                    </span>
                                    {(record.notes || []).map((note) => (
                                        <span className="tariff-toast-flag" key={note}>{note}</span>
                                    ))}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="tariff-toast-note">{lookup.tariff_data}</div>
                    )}

                    <div
                        className="tariff-toast-progress"
                        style={{ animationDuration: `${lifetime}ms` }}
                    />
                </div>
            ))}
        </div>
    );
};

export default TariffNotifications;
