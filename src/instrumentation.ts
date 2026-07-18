export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  const dataDir =
    process.env.HUDDLEUP_DATA_DIR?.trim() ||
    `${process.cwd()}/.data`;
  const uploadsDir =
    process.env.HUDDLEUP_UPLOADS_DIR?.trim() ||
    `${process.cwd()}/public/uploads`;

  console.log(`[huddleup] database: ${dataDir}`);
  console.log(`[huddleup] uploads: ${uploadsDir}`);

  if (!process.env.HUDDLEUP_DATA_DIR?.trim()) {
    console.warn(
      "[huddleup] HUDDLEUP_DATA_DIR is not set — redeploys will wipe personal codes and projects. " +
        "Point it to persistent storage outside the deploy folder.",
    );
  }
}
