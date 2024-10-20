"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

export default function SourcesPage({params} : {params: {project_id: string};}) {
  return (
    <div>
      <h4 className="text-3xl text-center mt-10">
        Sources Page
      </h4>
    </div>
  )
}

