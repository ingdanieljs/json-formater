import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";

export const JsonConverter = () => {
  const [input, setInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [phpArray, setPhpArray] = useState("");
  const [error, setError] = useState("");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const { toast } = useToast();

  const jsonToPhpArray = (obj: any, indent: number = 0): string => {
    const spaces = "    ".repeat(indent);

    if (obj === null) return "null";
    if (typeof obj === "string") return `'${obj.replace(/'/g, "\\'")}'`;
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      const items = obj.map(
        (item) => `${spaces}    ${jsonToPhpArray(item, indent + 1)}`
      );
      return `[\n${items.join(",\n")}\n${spaces}]`;
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "[]";

      const items = keys.map((key) => {
        const value = jsonToPhpArray(obj[key], indent + 1);
        return `${spaces}    '${key}' => ${value}`;
      });
      return `[\n${items.join(",\n")}\n${spaces}]`;
    }

    return String(obj);
  };

  const convertJson = () => {
    if (!input.trim()) {
      setError("Por favor, introduce un JSON válido");
      setFormattedJson("");
      setPhpArray("");
      return;
    }

    try {
      // Clean escaped characters more thoroughly
      let cleanInput = input.trim();

      // Handle escaped quotes
      cleanInput = cleanInput.replace(/\\"/g, '"');

      // Handle escaped newlines and tabs
      cleanInput = cleanInput.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

      // Handle escaped backslashes (but preserve intentional escapes)
      cleanInput = cleanInput.replace(/\\\\n/g, "\\n").replace(/\\\\t/g, "\\t");

      // Fix common issues with single backslashes that aren't valid escapes
      cleanInput = cleanInput.replace(/\\([^"\\\/bfnrtu])/g, "$1");

      const parsed = JSON.parse(cleanInput);

      // Format JSON
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);

      // Convert to PHP array
      const phpCode = jsonToPhpArray(parsed);
      setPhpArray(phpCode);

      setError("");

      toast({
        title: "Conversión exitosa",
        description: "JSON convertido correctamente",
      });
    } catch (err) {
      setError("JSON inválido. Verifica la sintaxis.");
      setFormattedJson("");
      setPhpArray("");

      toast({
        title: "Error de conversión",
        description: "El JSON proporcionado no es válido",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: "json" | "php") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "json") {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      } else {
        setCopiedPhp(true);
        setTimeout(() => setCopiedPhp(false), 2000);
      }

      toast({
        title: "Copiado",
        description: `${
          type === "json" ? "JSON" : "Array de PHP"
        } copiado al portapapeles`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          JSON to PHP Converter
        </h1>
        <p className="text-muted-foreground">
          Convierte JSON a array de PHP con formato limpio y minimalista
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Input JSON</span>
            {error && <AlertCircle className="h-4 w-4 text-error" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Pega tu JSON aquí (con o sin caracteres escapados)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          {error && (
            <div className="text-error text-sm font-medium">{error}</div>
          )}
          <Button onClick={convertJson} className="w-full" size="lg">
            Convertir JSON
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>JSON Formateado</span>
              {formattedJson && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formattedJson, "json")}
                  className="flex items-center gap-2"
                >
                  {copiedJson ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedJson ? "Copiado" : "Copiar"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-code-bg border border-code-border rounded-md p-4 min-h-[300px]">
              {formattedJson ? (
                <pre className="text-sm font-mono text-foreground overflow-auto">
                  {formattedJson}
                </pre>
              ) : (
                <div className="text-muted-foreground text-sm">
                  El JSON formateado aparecerá aquí...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Array de PHP</span>
              {phpArray && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(phpArray, "php")}
                  className="flex items-center gap-2"
                >
                  {copiedPhp ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedPhp ? "Copiado" : "Copiar"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-code-bg border border-code-border rounded-md p-4 min-h-[300px]">
              {phpArray ? (
                <pre className="text-sm font-mono text-foreground overflow-auto">
                  {phpArray}
                </pre>
              ) : (
                <div className="text-muted-foreground text-sm">
                  El array de PHP aparecerá aquí...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
