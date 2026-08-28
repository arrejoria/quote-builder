import { ServiceItem } from "../components/service-items";

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  defaultItems: Omit<ServiceItem, "id">[];
}

export const quoteTemplates: QuoteTemplate[] = [
  {
    id: "ecommerce",
    name: "Ecommerce (tienda online)",
    description: "Tienda lista para vender: catálogo, checkout y pagos configurados.",
    defaultItems: [
      {
        description: "Diseño y maquetación de tienda (tema a medida)",
        quantity: 1,
        price: 450000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Carga de catálogo inicial (hasta 20 productos)",
        quantity: 1,
        price: 90000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Configuración de pagos y envíos",
        quantity: 1,
        price: 60000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "QA de compra y puesta en producción",
        quantity: 1,
        price: 70000,
        taxRate: 21,
        discount: 0
      }
    ]
  },
  {
    id: "institucional",
    name: "Sitio institucional",
    description: "Presencia web para una empresa o profesional: home, servicios y contacto.",
    defaultItems: [
      {
        description: "Diseño de home y páginas internas",
        quantity: 1,
        price: 380000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Formulario de contacto integrado",
        quantity: 1,
        price: 45000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Optimización SEO básica",
        quantity: 1,
        price: 55000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Puesta en producción y dominio",
        quantity: 1,
        price: 40000,
        taxRate: 21,
        discount: 0
      }
    ]
  },
  {
    id: "app-movil",
    name: "App móvil (MVP)",
    description: "Primera versión de una app para iOS y Android.",
    defaultItems: [
      {
        description: "Diseño de UI/UX (Figma)",
        quantity: 1,
        price: 320000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Desarrollo frontend (React Native)",
        quantity: 1,
        price: 950000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Integración con backend / API",
        quantity: 1,
        price: 480000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Publicación en App Store y Play Store",
        quantity: 1,
        price: 90000,
        taxRate: 21,
        discount: 0
      }
    ]
  },
  {
    id: "consultoria",
    name: "Consultoría por horas",
    description: "Bloque de horas para tareas puntuales, soporte o mantenimiento.",
    defaultItems: [
      {
        description: "Relevamiento y diagnóstico inicial",
        quantity: 1,
        price: 60000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Horas de desarrollo",
        quantity: 10,
        price: 15000,
        taxRate: 21,
        discount: 0
      },
      {
        description: "Reunión de seguimiento semanal",
        quantity: 4,
        price: 12000,
        taxRate: 21,
        discount: 0
      }
    ]
  }
];
