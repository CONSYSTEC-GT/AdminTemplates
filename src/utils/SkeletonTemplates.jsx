import { Skeleton, Box, Card, CardContent, Stack } from '@mui/material';

const TemplateCardSkeleton = () => (
  <Card
    sx={{
      maxWidth: 300,
      height: 500,
      borderRadius: 3,
      mt: 3,
      mx: 2,
      border: '1px solid #e0e0e0',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <CardContent sx={{ p: 0 }}>
      {/* Header skeleton */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Skeleton variant="text" width="80%" height={30} />
        
        {/* Badges skeleton */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Box>
      </Box>
      
      {/* Imagen skeleton (placeholder para el posible botón de razón de rechazo) */}
      <Box sx={{ px: 2 }}>
        <Skeleton variant="rectangular" width="30%" height={32} sx={{ borderRadius: 1 }} />
      </Box>
      
      {/* Content skeleton */}
      <Box
        sx={{
          backgroundColor: '#FEF9F3',
          p: 2,
          mx: 1,
          my: 1,
          borderRadius: 2,
          minHeight: 302,
          width: 286,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            p: 1,
            mt: 1,
            borderRadius: 4,
            width: 284,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Text content skeleton */}
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
          </Box>
          
          {/* Buttons skeleton */}
          <Stack spacing={1}>
            <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 20 }} />
            <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 20 }} />
            <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 20 }} />
          </Stack>
        </Box>
      </Box>
    </CardContent>

    {/* Actions skeleton */}
    <Box sx={{ p: 2, mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
      <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: 1 }} />
    </Box>
  </Card>
);

export default TemplateCardSkeleton;