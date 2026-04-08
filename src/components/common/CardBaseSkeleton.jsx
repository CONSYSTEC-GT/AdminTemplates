import React from 'react';
import { Skeleton, Box } from '@mui/material';

const TemplateCardSkeleton = () => {
  return (
    <Box
      sx={{
        maxWidth: 350,
        height: 500,
        borderRadius: 3,
        mt: 3,
        mx: 2,
        border: '1px solid #e0e0e0',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      <Skeleton variant="text" width="60%" height={40} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={300} sx={{ mt: 2, borderRadius: 2 }} />
      <Skeleton variant="rounded" width={120} height={36} sx={{ mt: 2, alignSelf: 'flex-end' }} />
    </Box>
  );
};

export default TemplateCardSkeleton;