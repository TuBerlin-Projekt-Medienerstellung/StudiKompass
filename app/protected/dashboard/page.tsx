import Studiengangwahl from "@/components/studiengangwahl";
import { createClient } from "@/lib/supabase/server";
import { Shell, Award, Calendar, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
        <p className="text-sm text-gray-500">
          Verfolge deinen Weg zum Abschluss.
        </p>
      </div>

      <section className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#C40D1F] p-4 text-white">
          <div className="flex items-center justify-between">
            <Award className="h-6 w-6" />
            <h2 className="text-3xl font-bold">57%</h2>
          </div>

          <p className="text-sm">Gesamtfortschritt</p>

          <div className="mt-4 h-2 rounded-full bg-red-300">
            <div className="h-2 w-[57%] rounded-full bg-white" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Shell className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">103/180</h2>
              <p className="text-sm text-gray-500">ECTS</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Calendar className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">4</h2>
              <p className="text-sm text-gray-500">Semester</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Clock className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">SS 2027</h2>
              <p className="text-sm text-gray-500">Voraussichtlich</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}