import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { getExportFormat, setExportFormat, ExportFormat, getAccordionExpanded, setAccordionExpanded, AccordionExpansion } from "@/lib/exportUtils";

export default function SettingsPage() {
  const [exportFormat, setCurrentExportFormat] = useState<ExportFormat>("pdf");
  const [accordionExpansion, setCurrentAccordionExpansion] = useState<AccordionExpansion>("collapsed");

  useEffect(() => {
    setCurrentExportFormat(getExportFormat());
    setCurrentAccordionExpansion(getAccordionExpanded());
  }, []);

  const handleExportFormatChange = (format: ExportFormat) => {
    setCurrentExportFormat(format);
    setExportFormat(format);
  };

  const handleAccordionExpansionChange = (expansion: AccordionExpansion) => {
    setCurrentAccordionExpansion(expansion);
    setAccordionExpanded(expansion);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configuration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Theme</h4>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>
            Configure default export format for research data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Default Export Format</Label>
            <RadioGroup 
              value={exportFormat} 
              onValueChange={handleExportFormatChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="text-sm">
                  PDF - Professional formatted document
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="text-sm">
                  JSON - Raw data for integrations
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research Analysis</CardTitle>
          <CardDescription>
            Configure how research analysis content is displayed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Accordion Content</Label>
            <RadioGroup 
              value={accordionExpansion} 
              onValueChange={handleAccordionExpansionChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="collapsed" id="collapsed" />
                <Label htmlFor="collapsed" className="text-sm">
                  Collapsed - Click to expand sections
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expanded" id="expanded" />
                <Label htmlFor="expanded" className="text-sm">
                  Expanded - Show all content by default
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}