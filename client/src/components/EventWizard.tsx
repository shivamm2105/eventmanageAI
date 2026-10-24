import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Home,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EventRequirements, EventType, VenuePreference } from '@celebrai/shared';

interface EventWizardProps {
  initialValues?: Partial<EventRequirements>;
  isAiConfigured: boolean;
  onSubmit: (requirements: EventRequirements, demoMode: boolean) => void;
  onCancel: () => void;
}

export const EventWizard: React.FC<EventWizardProps> = ({
  initialValues,
  isAiConfigured,
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [demoMode, setDemoMode] = useState<boolean>(!isAiConfigured);

  // Form State
  const [title, setTitle] = useState(initialValues?.title || '');
  const [eventType, setEventType] = useState<EventType>(initialValues?.eventType || 'wedding');
  const [eventDate, setEventDate] = useState(
    initialValues?.eventDate ||
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [city, setCity] = useState(initialValues?.city || 'Jaipur');
  const [guestCount, setGuestCount] = useState<number>(initialValues?.guestCount || 150);
  const [budget, setBudget] = useState<number>(initialValues?.budget || 500000);
  const [currency, setCurrency] = useState<string>(initialValues?.currency || 'INR');
  const [venuePreference, setVenuePreference] = useState<VenuePreference>(
    initialValues?.venuePreference || 'banquet'
  );
  const [themePreference, setThemePreference] = useState(
    initialValues?.themePreference || 'Modern Royal Elegance'
  );
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    initialValues?.dietaryPreferences || ['Vegetarian', 'Jain Options Available']
  );
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialValues?.additionalInstructions || ''
  );

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Jain Options Available',
    'Halal',
    'Gluten-Free',
    'Nut Allergy Safe',
    'Dairy-Free',
    'Kids Menu',
  ];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 3) {
        newErrors.title = 'Title must be at least 3 characters long.';
      }
      if (!city.trim() || city.trim().length < 2) {
        newErrors.city = 'Please enter a valid city or location.';
      }
      if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
        newErrors.eventDate = 'Please select a valid date (YYYY-MM-DD).';
      }
      if (!guestCount || guestCount < 1 || guestCount > 50000) {
        newErrors.guestCount = 'Guest count must be between 1 and 50,000.';
      }
    }

    if (currentStep === 2) {
      if (!budget || budget < 1000) {
        newErrors.budget = 'Please specify a realistic budget (minimum 1,000).';
      }
      if (budget > 1000000000) {
        newErrors.budget = 'Budget exceeds the maximum allowable limit.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev));
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const requirements: EventRequirements = {
      title: title.trim(),
      eventType,
      eventDate,
      city: city.trim(),
      guestCount: Math.round(guestCount),
      budget: Math.round(budget),
      currency,
      venuePreference,
      themePreference: themePreference.trim(),
      dietaryPreferences,
      additionalInstructions: additionalInstructions.trim(),
    };

    onSubmit(requirements, demoMode);
  };

  const toggleDietary = (item: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Event Planning Wizard
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Provide your event details to generate a customized, date-aware plan with budget allocation.
        </p>

        {/* Step Progress Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { num: 1, label: 'Celebration Basics' },
            { num: 2, label: 'Budget & Venue' },
            { num: 3, label: 'Theme & Customization' },
          ].map((item) => (
            <div
              key={item.num}
              className={`p-3 rounded-xl border transition-all ${
                step === item.num
                  ? 'bg-brand-500/10 border-brand-500/50 text-brand-300'
                  : step > item.num
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === item.num
                      ? 'bg-brand-500 text-white'
                      : step > item.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > item.num ? <Check className="w-3.5 h-3.5" /> : item.num}
                </span>
                <span className="text-xs font-semibold truncate">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-sm">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="event-title" className="block text-sm font-semibold text-slate-200 mb-1.5">
                Celebration Name or Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rohan & Priya Wedding Celebration"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  errors.title ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-brand-500'
                }`}
                aria-describedby={errors.title ? 'title-error' : undefined}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <p id="title-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-type" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Celebration Type <span className="text-rose-400">*</span>
                </label>
                <select
                  id="event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="anniversary">Anniversary Celebration</option>
                  <option value="community">Community Event</option>
                  <option value="engagement">Engagement Party</option>
                  <option value="baby_shower">Baby Shower</option>
                  <option value="corporate_gala">Corporate Gala / Dinner</option>
                  <option value="other">Other Celebration</option>
                </select>
              </div>

              <div>
                <label htmlFor="event-date" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Target Event Date <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-white focus:outline-none focus:ring-2 ${
                      errors.eventDate ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-brand-500'
                    }`}
                    aria-describedby={errors.eventDate ? 'date-error' : undefined}
                    aria-invalid={Boolean(errors.eventDate)}
                  />
                </div>
                {errors.eventDate && (
                  <p id="date-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.eventDate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-city" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  City or Location <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="event-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Jaipur, Mumbai, Goa, Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                      errors.city ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-brand-500'
                    }`}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    aria-invalid={Boolean(errors.city)}
                  />
                </div>
                {errors.city && (
                  <p id="city-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="guest-count" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Expected Guests <span className="text-rose-400">*</span>
                </label>
                <input
                  id="guest-count"
                  type="number"
                  min="1"
                  max="50000"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-white focus:outline-none focus:ring-2 ${
                    errors.guestCount ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-brand-500'
                  }`}
                  aria-describedby={errors.guestCount ? 'guest-error' : undefined}
                  aria-invalid={Boolean(errors.guestCount)}
                />
                {errors.guestCount && (
                  <p id="guest-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.guestCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FINANCIALS & VENUE */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="total-budget" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Total Celebration Budget <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="total-budget"
                    type="number"
                    min="1000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-white font-mono text-lg focus:outline-none focus:ring-2 ${
                      errors.budget ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-brand-500'
                    }`}
                    aria-describedby={errors.budget ? 'budget-error' : undefined}
                    aria-invalid={Boolean(errors.budget)}
                  />
                </div>
                {errors.budget && (
                  <p id="budget-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.budget}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Calculations use exact integer arithmetic with automated 10% contingency reserve.
                </p>
              </div>

              <div>
                <label htmlFor="currency-select" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (AED - UAE Dirham)</option>
                  <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Venue Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'banquet', label: 'Banquet / Hotel' },
                  { id: 'outdoor', label: 'Outdoor Lawn / Garden' },
                  { id: 'beach', label: 'Beach / Waterfront' },
                  { id: 'indoor', label: 'Intimate Indoor Hall' },
                  { id: 'home', label: 'Private Home / Estate' },
                  { id: 'flexible', label: 'Flexible / Not Decided' },
                ].map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => setVenuePreference(venue.id as VenuePreference)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                      venuePreference === venue.id
                        ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{venue.label}</span>
                    {venuePreference === venue.id && <Check className="w-4 h-4 text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: THEME & TAILORING */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="theme-pref" className="block text-sm font-semibold text-slate-200 mb-1.5">
                Theme or Aesthetic Preference
              </label>
              <input
                id="theme-pref"
                type="text"
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value)}
                placeholder="e.g., Royal Marigold & Velvet, Boho Chic, Vintage Gatsby, Retro Disco"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-slate-400">
                AI will generate custom color palette hex swatches, decor concepts, and ambient styling.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Dietary & Catering Considerations
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((opt) => {
                  const selected = dietaryPreferences.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDietary(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400'
                          : 'bg-slate-950 border border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="additional-instructions" className="block text-sm font-semibold text-slate-200 mb-1.5">
                Special Instructions or Desired Highlights (Optional)
              </label>
              <textarea
                id="additional-instructions"
                rows={3}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., Surprise flash mob for the parents, eco-friendly seed paper favors, drone cinematography, need a quiet corner for elder guests."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Demo Mode Toggle Banner */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
              <input
                id="demo-mode-checkbox"
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs">
                <label htmlFor="demo-mode-checkbox" className="font-semibold text-slate-200 cursor-pointer">
                  Use Interactive Demo Mode (Instant plan generation)
                </label>
                <p className="text-slate-400 mt-0.5">
                  Generates an instantly verified, structured celebration plan matching your budget without requiring a Gemini API key. All outputs will be clearly labeled as sample data.
                </p>
                {!isAiConfigured && !demoMode && (
                  <p className="mt-1 text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Notice: GEMINI_API_KEY is not configured on the server; enabling Demo Mode is recommended.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-2 shadow-glow transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generate My Event Plan</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
