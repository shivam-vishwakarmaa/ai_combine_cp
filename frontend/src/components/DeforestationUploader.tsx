import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

interface DeforestationUploaderProps {
  onImagesSelected: (before: File, after: File) => void;
  onAnalyze: (before?: File, after?: File) => void;
  loading: boolean;
  disabled: boolean;
}

interface DemoSample {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  region: string;
  desc: string;
  beforeUrl: string;
  afterUrl: string;
  nameA: string;
  nameB: string;
}

const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'sample-0011',
    title: 'Benchmark Reserve (#0011)',
    tag: 'Primary Benchmark',
    tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    region: 'Tropical Dense Forest',
    desc: 'Dense pre-harvest canopy vs localized illegal timber clearing',
    beforeUrl: '/samples/test_000011_A.png',
    afterUrl: '/samples/test_000011_B.png',
    nameA: 'test_000011_A.png',
    nameB: 'test_000011_B.png',
  },
  {
    id: 'sample-amazon',
    title: 'Amazon Basin Agricultural Clearing',
    tag: 'Slash & Burn',
    tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    region: 'Rondônia, Brazil',
    desc: 'Virgin primary rainforest converted to cattle ranching clearing',
    beforeUrl: '/samples/amazon_deforestation_A.png',
    afterUrl: '/samples/amazon_deforestation_B.png',
    nameA: 'amazon_deforestation_A.png',
    nameB: 'amazon_deforestation_B.png',
  },
  {
    id: 'sample-borneo',
    title: 'Borneo Concession Logging',
    tag: 'Logging Tracts',
    tagColor: 'bg-amber-950 text-amber-300 border-amber-800',
    region: 'Kalimantan, Indonesia',
    desc: 'Continuous rainforest canopy traversed by logging corridors',
    beforeUrl: '/samples/borneo_logging_A.png',
    afterUrl: '/samples/borneo_logging_B.png',
    nameA: 'borneo_logging_A.png',
    nameB: 'borneo_logging_B.png',
  },
];

export const DeforestationUploader: React.FC<DeforestationUploaderProps> = ({
  onImagesSelected,
  onAnalyze,
  loading,
  disabled,
}) => {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeDimensions, setBeforeDimensions] = useState<{ w: number; h: number } | null>(null);
  const [afterDimensions, setAfterDimensions] = useState<{ w: number; h: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Sync valid files to parent component state reliably
  useEffect(() => {
    if (
      beforeFile &&
      afterFile &&
      beforeDimensions?.w === 480 &&
      afterDimensions?.w === 480
    ) {
      onImagesSelected(beforeFile, afterFile);
    }
  }, [beforeFile, afterFile, beforeDimensions, afterDimensions, onImagesSelected]);

  const validateAndSetImage = (
    file: File,
    type: 'before' | 'after'
  ) => {
    setErrorMsg(null);
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width !== 480 || img.height !== 480) {
        setErrorMsg(`Expected image dimensions: 480×480 pixels. Selected ${type} image is ${img.width}×${img.height}.`);
        if (type === 'before') {
          setBeforeFile(null);
          setBeforePreview(null);
          setBeforeDimensions(null);
        } else {
          setAfterFile(null);
          setAfterPreview(null);
          setAfterDimensions(null);
        }
        return;
      }

      if (type === 'before') {
        setBeforeFile(file);
        setBeforePreview(url);
        setBeforeDimensions({ w: img.width, h: img.height });
      } else {
        setAfterFile(file);
        setAfterPreview(url);
        setAfterDimensions({ w: img.width, h: img.height });
      }
    };

    img.onerror = () => {
      setErrorMsg(`Failed to decode selected ${type} image.`);
    };

    img.src = url;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetImage(e.target.files[0], type);
    }
  };

  const loadAndAnalyzeSample = async (sample: DemoSample, autoRun: boolean) => {
    setErrorMsg(null);
    setLoadingSampleId(sample.id);
    try {
      const [resA, resB] = await Promise.all([
        fetch(sample.beforeUrl),
        fetch(sample.afterUrl)
      ]);

      if (!resA.ok || !resB.ok) {
        throw new Error(`Failed to load sample pair (${sample.beforeUrl}, ${sample.afterUrl})`);
      }

      const [blobA, blobB] = await Promise.all([resA.blob(), resB.blob()]);
      const fileA = new File([blobA], sample.nameA, { type: 'image/png' });
      const fileB = new File([blobB], sample.nameB, { type: 'image/png' });

      validateAndSetImage(fileA, 'before');
      validateAndSetImage(fileB, 'after');

      if (autoRun) {
        onAnalyze(fileA, fileB);
      }
    } catch (err: any) {
      setErrorMsg('Error loading sample pair: ' + err.message);
    } finally {
      setLoadingSampleId(null);
    }
  };

  const isReady = beforeFile && afterFile && beforeDimensions?.w === 480 && afterDimensions?.w === 480 && !loading && !disabled;

  return (
    <GlassCard hoverGlow={false} className="space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-forest-400" />
            Bi-Temporal Satellite Image Input
          </h2>
          <p className="text-xs text-charcoal-400 mt-0.5">Upload paired 480×480 RGB satellite images or select a demonstration pair below</p>
        </div>

        <div className="text-[11px] font-mono text-charcoal-400">
          Format: <span className="text-forest-400">480×480 PNG/JPG</span>
        </div>
      </div>

      {/* Demonstration Sample Gallery */}
      <div className="p-4 rounded-xl border border-charcoal-800/80 bg-charcoal-950/80 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-forest-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Sample Demonstration Gallery (Ready-to-Test Satellite Pairs)
            </h3>
          </div>
          <span className="text-[10px] text-charcoal-400 font-mono">
            Click &ldquo;⚡ Run AI&rdquo; on any sample to instantly inspect &amp; execute analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              className="p-3 rounded-lg border border-charcoal-800 hover:border-forest-700/60 bg-charcoal-900/60 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${sample.tagColor}`}>
                    {sample.tag}
                  </span>
                  <span className="text-[9px] text-charcoal-500 font-mono">480×480 RGB</span>
                </div>
                <h4 className="text-xs font-bold text-white">{sample.title}</h4>
                <p className="text-[10px] text-charcoal-400 mt-0.5 line-clamp-2">{sample.desc}</p>
              </div>

              {/* Thumbnail Previews */}
              <div className="flex items-center justify-center space-x-2 bg-charcoal-950 p-2 rounded border border-charcoal-800/50">
                <div className="flex flex-col items-center">
                  <img
                    src={sample.beforeUrl}
                    alt={`${sample.title} Before`}
                    className="w-16 h-16 object-cover rounded border border-cyan-800/60 shadow"
                  />
                  <span className="text-[8px] font-mono text-cyan-400 mt-0.5 font-bold">BEFORE (A)</span>
                </div>
                <div className="text-charcoal-600 font-mono text-xs">→</div>
                <div className="flex flex-col items-center">
                  <img
                    src={sample.afterUrl}
                    alt={`${sample.title} After`}
                    className="w-16 h-16 object-cover rounded border border-amber-800/60 shadow"
                  />
                  <span className="text-[8px] font-mono text-amber-400 mt-0.5 font-bold">AFTER (B)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 pt-1">
                <button
                  type="button"
                  disabled={loading || disabled || loadingSampleId === sample.id}
                  onClick={() => loadAndAnalyzeSample(sample, true)}
                  className="flex-1 py-1.5 px-2 rounded bg-forest-950/80 hover:bg-forest-900 text-forest-300 border border-forest-700/60 text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition disabled:opacity-50"
                >
                  {loadingSampleId === sample.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-forest-400" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-forest-400" />
                  )}
                  <span>⚡ Run AI</span>
                </button>
                <button
                  type="button"
                  disabled={loading || disabled || loadingSampleId === sample.id}
                  onClick={() => loadAndAnalyzeSample(sample, false)}
                  className="py-1.5 px-2.5 rounded bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 border border-charcoal-700 text-[10px] font-mono transition disabled:opacity-50"
                  title="Load into Before/After input boxes"
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BEFORE IMAGE BOX */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-charcoal-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              BEFORE IMAGE (A)
            </span>
            {beforeDimensions && (
              <span className="text-forest-400 bg-forest-950/60 px-2 py-0.5 rounded border border-forest-900">
                {beforeDimensions.w}×{beforeDimensions.h} RGB
              </span>
            )}
          </div>

          <div
            onClick={() => beforeInputRef.current?.click()}
            className={`relative group aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition overflow-hidden ${
              beforePreview
                ? 'border-forest-500/50 bg-charcoal-900/60'
                : 'border-charcoal-700 hover:border-charcoal-500 bg-charcoal-950/40'
            }`}
          >
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'before')}
            />

            {beforePreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={beforePreview}
                  alt="Before Preview"
                  className="w-full h-full object-contain rounded-lg shadow"
                />
                <div className="absolute inset-0 bg-charcoal-950/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                  <span className="text-xs text-white bg-charcoal-800 px-3 py-1.5 rounded-lg border border-charcoal-700 font-mono flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-2 text-charcoal-400">
                <Upload className="w-8 h-8 text-charcoal-500 group-hover:text-cyan-400 transition" />
                <p className="text-xs font-medium text-charcoal-300">Click or drag BEFORE satellite image</p>
                <p className="text-[10px] text-charcoal-500 font-mono">Required: 480 × 480 pixels RGB</p>
              </div>
            )}
          </div>
          {beforeFile && (
            <p className="text-[11px] text-charcoal-400 truncate font-mono">File: {beforeFile.name}</p>
          )}
        </div>

        {/* AFTER IMAGE BOX */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-charcoal-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              AFTER IMAGE (B)
            </span>
            {afterDimensions && (
              <span className="text-forest-400 bg-forest-950/60 px-2 py-0.5 rounded border border-forest-900">
                {afterDimensions.w}×{afterDimensions.h} RGB
              </span>
            )}
          </div>

          <div
            onClick={() => afterInputRef.current?.click()}
            className={`relative group aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition overflow-hidden ${
              afterPreview
                ? 'border-forest-500/50 bg-charcoal-900/60'
                : 'border-charcoal-700 hover:border-charcoal-500 bg-charcoal-950/40'
            }`}
          >
            <input
              ref={afterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'after')}
            />

            {afterPreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={afterPreview}
                  alt="After Preview"
                  className="w-full h-full object-contain rounded-lg shadow"
                />
                <div className="absolute inset-0 bg-charcoal-950/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                  <span className="text-xs text-white bg-charcoal-800 px-3 py-1.5 rounded-lg border border-charcoal-700 font-mono flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-2 text-charcoal-400">
                <Upload className="w-8 h-8 text-charcoal-500 group-hover:text-yellow-400 transition" />
                <p className="text-xs font-medium text-charcoal-300">Click or drag AFTER satellite image</p>
                <p className="text-[10px] text-charcoal-500 font-mono">Required: 480 × 480 pixels RGB</p>
              </div>
            )}
          </div>
          {afterFile && (
            <p className="text-[11px] text-charcoal-400 truncate font-mono">File: {afterFile.name}</p>
          )}
        </div>
      </div>

      {/* ANALYZE BUTTON */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={!isReady}
          onClick={() => {
            if (beforeFile && afterFile) {
              onAnalyze(beforeFile, afterFile);
            }
          }}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg ${
            isReady
              ? 'bg-forest-600 hover:bg-forest-500 text-white shadow-forest-950/50 cursor-pointer border border-forest-400/40'
              : 'bg-charcoal-800 text-charcoal-500 border border-charcoal-700/60 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-forest-400" />
              <span>RUNNING AI ANALYSIS...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-forest-300" />
              <span>Analyze Deforestation</span>
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
};

export default DeforestationUploader;
