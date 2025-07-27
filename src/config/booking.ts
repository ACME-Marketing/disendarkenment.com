export const BOOKING_CONFIG = {
  cal: {
    username: "takealook",
    events: {
      consultation: {
        slug: "disendarkenment-journey-readiness-call",
        namespace: "disendarkenment-journey-readiness-call",
        config: {
          layout: "month_view"
        }
      },
      preparation: {
        slug: "preparation-session",
        namespace: "preparation",
        config: {
          layout: "month_view"
        }
      },
      integration: {
        slug: "integration-session", 
        namespace: "integration",
        config: {
          layout: "month_view"
        }
      }
    }
  }
};

// Helper function to generate Cal.com link
export function getCalLink(eventType: keyof typeof BOOKING_CONFIG.cal.events): string {
  const event = BOOKING_CONFIG.cal.events[eventType];
  return `${BOOKING_CONFIG.cal.username}/${event.slug}`;
}

// Helper function to get event config
export function getEventConfig(eventType: keyof typeof BOOKING_CONFIG.cal.events) {
  return BOOKING_CONFIG.cal.events[eventType];
}