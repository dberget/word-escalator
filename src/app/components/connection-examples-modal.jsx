import { X } from "lucide-react";

const ConnectionExamplesModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-indigo-900">
              Connection Types Explained
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Direct Connections */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-indigo-900 flex items-center gap-2">
              <div className="text-green-600 text-2xl">→</div>
              Direct Connections
            </h3>
            <p className="text-gray-600 mb-2">
              Direct connections are compound phrases or clear descriptive
              relationships that naturally go together.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-indigo-900">Examples:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <span className="font-medium">Compound Phrases:</span> "hot
                  dog", "ice cream", "bread slice", "rain drop"
                </li>
                <li>
                  <span className="font-medium">Descriptive Properties:</span>{" "}
                  "sharp blade", "bright light", "cold snow"
                </li>
                <li>
                  <span className="font-medium">Part/Whole Relations:</span>{" "}
                  "bike wheel", "tree branch", "book page"
                </li>
              </ul>
            </div>
          </div>

          {/* Indirect Connections */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-indigo-900 flex items-center gap-2">
              <div className="text-blue-600 text-2xl">→</div>
              Indirect Connections
            </h3>
            <p className="text-gray-600 mb-2">
              Indirect connections require a mental leap or understanding of
              context to connect the words.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-indigo-900">Examples:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <span className="font-medium">Slang/Synonyms:</span> "cash →
                  dough" (money), "wheels → car" (informal)
                </li>
                <li>
                  <span className="font-medium">Actions/Tools:</span> "slice →
                  knife" (what it does), "write → pen" (action/tool)
                </li>
                <li>
                  <span className="font-medium">Category Relations:</span>{" "}
                  "dough → bread" (stages), "seed → tree" (progression)
                </li>
                <li>
                  <span className="font-medium">Common Associations:</span>{" "}
                  "crown → king" (symbol), "beach → sand" (location)
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tip:</span> If you're not sure about
              a connection, think about whether the words form a natural phrase
              (direct) or if you need extra context to understand their
              relationship (indirect).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionExamplesModal;
