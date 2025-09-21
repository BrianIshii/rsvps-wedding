import { json, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";

interface RSVP {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  dietary_restrictions?: string;
  message?: string;
  created_at: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async ({ context }) => {
  try {
    // For development, use mock data if DB is not available
    if (!context?.DB) {
      return json({ rsvps: [] });
    }
    
    const rsvps = await context.DB.prepare(
      "SELECT * FROM rsvps ORDER BY created_at DESC LIMIT 10"
    ).all();
    return json({ rsvps: rsvps.results || [] });
  } catch (error) {
    console.error("Error loading RSVPs:", error);
    return json({ rsvps: [] });
  }
};

export const action: ActionFunction = async ({ request, context }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const attending = formData.get("attending") === "true";
    const guests = parseInt(formData.get("guests")?.toString() || "1");
    const dietary_restrictions = formData.get("dietary_restrictions")?.toString();
    const message = formData.get("message")?.toString();

    if (!name || !email) {
      return json({ error: "Name and email are required" }, { status: 400 });
    }

    // For development, just return success if DB is not available
    if (!context?.DB) {
      console.log("RSVP submitted (development mode):", { name, email, attending, guests, dietary_restrictions, message });
      return json({ success: true });
    }

    await context.DB.prepare(`
      INSERT INTO rsvps (name, email, attending, guests, dietary_restrictions, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, email, attending, guests, dietary_restrictions || null, message || null).run();

    return json({ success: true });
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return json({ error: "Failed to save RSVP. Please try again." }, { status: 500 });
  }
};

export default function Index() {
  const { rsvps } = useLoaderData<{ rsvps: RSVP[] }>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attending: true,
    guests: 1,
    dietary_restrictions: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            💕 Wedding RSVP
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Please let us know if you'll be joining us for our special day
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Wedding Details */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Wedding Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700">Date & Time</h3>
              <p className="text-gray-600">Saturday, June 15th, 2024 at 4:00 PM</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Location</h3>
              <p className="text-gray-600">Garden Venue<br />123 Wedding Lane<br />Beautiful City, BC</p>
            </div>
          </div>
        </section>

        {/* RSVP Form */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">RSVP Form</h2>
          
          {actionData?.success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
              Thank you! Your RSVP has been submitted successfully.
            </div>
          )}

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              {actionData.error}
            </div>
          )}

          <form method="post" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Will you be attending? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="true"
                    checked={formData.attending}
                    onChange={() => setFormData(prev => ({ ...prev, attending: true }))}
                    className="mr-3 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-gray-700">Yes, I'll be there! 🎉</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="false"
                    checked={!formData.attending}
                    onChange={() => setFormData(prev => ({ ...prev, attending: false }))}
                    className="mr-3 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-gray-700">Sorry, I can't make it 😢</span>
                </label>
              </div>
            </div>

            {formData.attending && (
              <>
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <textarea
                    id="dietary_restrictions"
                    name="dietary_restrictions"
                    rows={3}
                    value={formData.dietary_restrictions}
                    onChange={handleChange}
                    placeholder="Please let us know about any dietary restrictions or allergies..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message for the Couple
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Share your excitement, well wishes, or any other message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 text-white py-3 px-6 rounded-md font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit RSVP"}
            </button>
          </form>
        </section>

        {/* Recent RSVPs */}
        {rsvps.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent RSVPs</h2>
            <div className="space-y-4">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="border-l-4 border-rose-200 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{rsvp.name}</p>
                      <p className="text-sm text-gray-600">
                        {rsvp.attending ? (
                          `🎉 Attending with ${rsvp.guests} guest${rsvp.guests > 1 ? 's' : ''}`
                        ) : (
                          "😢 Cannot attend"
                        )}
                      </p>
                      {rsvp.message && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{rsvp.message}"</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            Made with 💕 for our special day
          </p>
        </div>
      </footer>
    </div>
  );
}

