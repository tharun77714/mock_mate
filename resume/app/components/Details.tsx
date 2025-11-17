import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score, customColors }: { score: number, customColors?: { primary: string; secondary: string; accent: string; background: string } }) => {
  return (
      <div
          className={cn(
              "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
              score > 69
                  ? "bg-badge-green"
                  : score > 39
                      ? "bg-badge-yellow"
                      : "bg-badge-red"
          )}
      >
        <img
            src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
            alt="score"
            className="size-4"
        />
        <p
            className={cn(
                "text-sm font-medium",
                score > 69
                    ? "text-badge-green-text"
                    : score > 39
                        ? "text-badge-yellow-text"
                        : "text-badge-red-text"
            )}
        >
          {score}/100
        </p>
      </div>
  );
};

const CategoryHeader = ({
                          title,
                          categoryScore,
                          customColors,
                        }: {
  title: string;
  categoryScore: number;
  customColors?: { primary: string; secondary: string; accent: string; background: string };
}) => {
  return (
      <div className="flex flex-row gap-4 items-center py-2">
        <p className="text-2xl font-semibold text-white" style={{ color: customColors?.primary || '#ffffff' }}>{title}</p>
        <ScoreBadge score={categoryScore} customColors={customColors} />
      </div>
  );
};

const CategoryContent = ({
                           tips,
                         }: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4" style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(30, 58, 138, 0.25)',
          backdropFilter: 'blur(8px)'
        }}>
          {tips.map((tip, index) => (
              <div className="flex flex-row gap-2 items-center" key={index}>
                <img
                    src={
                      tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"
                    }
                    alt="score"
                    className="size-5"
                />
                <p className="text-xl text-gray-300">{tip.tip}</p>
              </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          {tips.map((tip, index) => (
              <div
                  key={index + tip.tip}
                  className={cn(
                      "flex flex-col gap-2 rounded-2xl p-4",
                      tip.type === "good"
                          ? "bg-green-900/30 border border-green-700/50 text-green-400"
                          : "bg-yellow-900/30 border border-yellow-700/50 text-yellow-400"
                  )}
              >
                <div className="flex flex-row gap-2 items-center">
                  <img
                      src={
                        tip.type === "good"
                            ? "/icons/check.svg"
                            : "/icons/warning.svg"
                      }
                      alt="score"
                      className="size-5"
                  />
                  <p className="text-xl font-semibold">{tip.tip}</p>
                </div>
                <p className="text-gray-300">{tip.explanation}</p>
              </div>
          ))}
        </div>
      </div>
  );
};

const Details = ({ feedback, customColors }: { feedback: Feedback, customColors?: { primary: string; secondary: string; accent: string; background: string } }) => {
  return (
      <div className="flex flex-col gap-4 w-full">
        <Accordion>
          <AccordionItem id="tone-style">
            <AccordionHeader itemId="tone-style">
              <CategoryHeader
                  title="Tone & Style"
                  categoryScore={feedback.toneAndStyle.score}
                  customColors={customColors}
              />
            </AccordionHeader>
            <AccordionContent itemId="tone-style">
              <CategoryContent tips={feedback.toneAndStyle.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="content">
            <AccordionHeader itemId="content">
              <CategoryHeader
                  title="Content"
                  categoryScore={feedback.content.score}
                  customColors={customColors}
              />
            </AccordionHeader>
            <AccordionContent itemId="content">
              <CategoryContent tips={feedback.content.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="structure">
            <AccordionHeader itemId="structure">
              <CategoryHeader
                  title="Structure"
                  categoryScore={feedback.structure.score}
                  customColors={customColors}
              />
            </AccordionHeader>
            <AccordionContent itemId="structure">
              <CategoryContent tips={feedback.structure.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="skills">
            <AccordionHeader itemId="skills">
              <CategoryHeader
                  title="Skills"
                  categoryScore={feedback.skills.score}
                  customColors={customColors}
              />
            </AccordionHeader>
            <AccordionContent itemId="skills">
              <CategoryContent tips={feedback.skills.tips} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
  );
};

export default Details;
