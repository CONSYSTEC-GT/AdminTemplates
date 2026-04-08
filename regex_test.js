const str = "4::aW1hZ2UvcG5n:ARYodqgrlhsAkOVWUcUyeav0cbqW-OHqBENX1d9D2oreH-aMXD-UFSQU7C9hNRyXZayvXtpWaR_SBRIkpNsyp3fmgSpZO4CoixbfVlvIso3VfA:e:1773617315:2281283925530161:61550837828231:ARbhuqPEjm3NnFXMJhA\n4::aW1hZ2UvcG5n:ARY-87buaORYj9yacxYSNaV1xrK3lWR2pm0SXwXPj3N5hfoAbLqr6UF_SLc4vTBFT0ePR5yaHVZk4yVvA_qlcPdUEHAzWNJW4ImBvmQsnNZDkw:e:1773617315:2281283925530161:61550837828231:ARZ2oTm0Qsio2oCqx7k";

const SAMPLE_MEDIA_REGEX = /^\d+::[A-Za-z0-9+/._=-]+(?::[A-Za-z0-9+/._=-]+)+$/;

const isValidSampleMedia = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // sampleMedia can be multi-line (e.g. for templates with multiple example images)
  const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
  console.log("Lines to test:", lines);
  return lines.length > 0 && lines.every(line => {
    const res = SAMPLE_MEDIA_REGEX.test(line);
    console.log("Testing line:", line, "Result:", res);
    return res;
  });
};

console.log("Final result:", isValidSampleMedia(str));
