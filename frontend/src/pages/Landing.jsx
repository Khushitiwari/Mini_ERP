import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Package,
  ShoppingCart,
  Factory,
  BarChart3,
  ClipboardList,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Box, Grid, Stack, Typography, Button, Card, CardContent } from '@mui/material';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, md: 6 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Factory size={20} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} color="primary.main">
              Shiv Furniture Works
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ERP Management System
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<LogIn size={18} />}
          onClick={() => navigate('/login')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Login to ERP
        </Button>
      </Box>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
          color: 'white',
          px: { xs: 3, md: 10 },
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.8, mb: 1, display: 'block' }}>
          ENTERPRISE RESOURCE PLANNING
        </Typography>
        <Typography variant="h2" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '2rem', md: '3.2rem' } }}>
          Shiv Furniture Works
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.85, mb: 1, fontWeight: 400 }}>
          From Demand to Delivery — All in One Place
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.75, mb: 4, maxWidth: 600, mx: 'auto' }}>
          A centralized ERP that connects Sales, Purchase, Manufacturing, and Inventory —
          replacing Excel sheets and WhatsApp with real-time visibility and automated procurement.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<LogIn size={20} />}
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: 'white',
              color: '#6366f1',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
          >
            Login to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(255,255,255,0.6)',
              color: 'white',
              borderRadius: 3,
              px: 4,
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </Stack>
      </Box>

      <Box sx={{ backgroundColor: '#1e1b4b', color: 'white', py: 4, px: { xs: 3, md: 10 } }}>
        <Grid container spacing={3} justifyContent="center" textAlign="center">
          {[
            { value: '6', label: 'User Roles', icon: <Shield size={24} /> },
            { value: '7', label: 'Core Modules', icon: <ClipboardList size={24} /> },
            { value: '100%', label: 'Automated Procurement', icon: <Zap size={24} /> },
            { value: 'Real-time', label: 'Stock Visibility', icon: <TrendingUp size={24} /> },
          ].map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ color: '#a78bfa' }}>{stat.icon}</Box>
                <Typography variant="h4" fontWeight={800}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {stat.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 3, md: 10 }, py: 8, backgroundColor: '#fafafa' }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          The Problem We Solve
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={5} maxWidth={600} mx="auto">
          Shiv Furniture Works was managing everything manually — leading to delays, confusion, and lost revenue.
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              team: 'Sales Team',
              color: '#ef4444',
              problems: [
                'Sold products without checking stock',
                'Customers received delayed deliveries',
                'No visibility on available inventory',
              ],
            },
            {
              team: 'Purchase Team',
              color: '#f59e0b',
              problems: [
                "Didn't know when raw materials ran low",
                'Vendors received last-minute urgent orders',
                'No procurement planning',
              ],
            },
            {
              team: 'Manufacturing',
              color: '#8b5cf6',
              problems: [
                "Operators didn't know what to build next",
                'BoMs maintained on paper',
                'Work orders not tracked',
              ],
            },
            {
              team: 'Management',
              color: '#6366f1',
              problems: [
                'No visibility into pending orders',
                'No production delay alerts',
                'No manufacturing efficiency data',
              ],
            },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: '100%', borderTop: `4px solid ${item.color}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2} color={item.color}>
                    {item.team}
                  </Typography>
                  <Stack spacing={1}>
                    {item.problems.map((p, j) => (
                      <Stack key={j} direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ color: item.color, mt: 0.3, flexShrink: 0 }}>✕</Box>
                        <Typography variant="body2" color="text.secondary">
                          {p}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box id="features" sx={{ px: { xs: 3, md: 10 }, py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Core Modules
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={5} maxWidth={600} mx="auto">
          Every module works together through a single shared inventory system.
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              icon: <Package size={28} />,
              title: 'Product Management',
              color: '#6366f1',
              desc: 'Manage finished goods and raw materials with real-time On Hand, Reserved, and Free-to-Use stock visibility. Configure MTS/MTO procurement strategies per product.',
            },
            {
              icon: <ShoppingCart size={28} />,
              title: 'Sales Management',
              color: '#10b981',
              desc: 'Create sales orders, check stock availability, reserve inventory on confirm, deliver orders, and auto-trigger procurement when stock is insufficient.',
            },
            {
              icon: <ClipboardList size={28} />,
              title: 'Purchase Management',
              color: '#f59e0b',
              desc: 'Create purchase orders manually or via auto-procurement. Receive goods and automatically update stock levels. Track partial and full receipts.',
            },
            {
              icon: <Factory size={28} />,
              title: 'Manufacturing',
              color: '#8b5cf6',
              desc: 'Manufacturing Orders with BoM-driven component requirements, Work Orders per operation (Assembly, Painting, Packing), work centers, and stock auto-update on completion.',
            },
            {
              icon: <Zap size={28} />,
              title: 'Procurement Automation',
              color: '#ef4444',
              desc: "The smart layer: when a sales order can't be fulfilled from stock, the system automatically creates a Purchase Order or Manufacturing Order based on product configuration.",
            },
            {
              icon: <BarChart3 size={28} />,
              title: 'Inventory & Dashboard',
              color: '#0ea5e9',
              desc: 'Real-time stock ledger tracking every movement. Live dashboard with charts for order status, stock levels, and movement trends.',
            },
          ].map((mod, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: '100%',
                  transition: '0.2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ color: mod.color, mb: 1.5 }}>{mod.icon}</Box>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    {mod.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mod.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 3, md: 10 }, py: 8, backgroundColor: '#fafafa' }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Who Uses This System
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={5}>
          Role-based access ensures every team member sees only what they need.
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {[
            { role: 'Admin', access: 'Full system access', color: '#6366f1' },
            { role: 'Sales User', access: 'Sales module', color: '#10b981' },
            { role: 'Purchase User', access: 'Purchase module', color: '#f59e0b' },
            { role: 'Manufacturing', access: 'MFG + BoM modules', color: '#8b5cf6' },
            { role: 'Inventory Manager', access: 'Stock & inventory', color: '#0ea5e9' },
            { role: 'Business Owner', access: 'Dashboard + products', color: '#ef4444' },
          ].map((r, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Card sx={{ textAlign: 'center', borderTop: `3px solid ${r.color}`, height: '100%' }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: `${r.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <Shield size={20} color={r.color} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {r.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.access}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 3, md: 10 }, py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={5}>
          How It Works
        </Typography>
        <Stack spacing={3} maxWidth={700} mx="auto">
          {[
            {
              step: '01',
              title: 'Customer Places Order',
              desc: 'Sales User creates a Sales Order. System checks stock availability instantly.',
              color: '#6366f1',
            },
            {
              step: '02',
              title: 'Smart Procurement Triggers',
              desc: 'If stock is insufficient, the system auto-creates a Manufacturing Order or Purchase Order — no manual intervention.',
              color: '#8b5cf6',
            },
            {
              step: '03',
              title: 'Manufacturing Executes',
              desc: 'Manufacturing User sees the MO with full BoM — components, work orders, durations — and completes each step.',
              color: '#10b981',
            },
            {
              step: '04',
              title: 'Stock Updates Automatically',
              desc: 'On completion, raw materials are consumed and finished goods are added. Stock Ledger records every movement.',
              color: '#f59e0b',
            },
            {
              step: '05',
              title: 'Order Delivered',
              desc: 'Sales User marks delivery. Stock decreases. Audit log records the full chain from order to delivery.',
              color: '#ef4444',
            },
          ].map((step, i) => (
            <Stack key={i} direction="row" spacing={3} alignItems="flex-start">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  backgroundColor: step.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography variant="h6" fontWeight={800} color="white">
                  {step.step}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.desc}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          textAlign: 'center',
          px: { xs: 3, md: 10 },
          py: 8,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          Ready to Manage Shiv Furniture Works?
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
          Log in with your role credentials to access your module.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<LogIn size={20} />}
          onClick={() => navigate('/login')}
          sx={{
            backgroundColor: 'white',
            color: '#6366f1',
            fontWeight: 700,
            borderRadius: 3,
            px: 5,
            py: 1.5,
          }}
        >
          Login to ERP
        </Button>
      </Box>

      <Box sx={{ backgroundColor: '#1e1b4b', color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 3 }}>
        <Typography variant="body2">
          © 2026 Shiv Furniture Works ERP — Built for Odoo Mini ERP Hackathon
        </Typography>
      </Box>
    </Box>
  );
}
