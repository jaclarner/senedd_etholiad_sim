import React from 'react';

/**
 * Modal component that displays an educational warning about the simulator
 * @param {Object} props
 * @param {Boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onConfirm - Function to call when user confirms understanding
 */
function WarningModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-container warning-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="warning-icon">⚠️</span> Educational Tool Warning
          </h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="warning-intro">
            Please note that this simulator is designed as an <strong>educational tool</strong>, not a predictive model. It makes several assumptions about 2021 vote share (see methodology)
            and should <strong>not</strong> be used to predict election outcomes.
          </p>
          
          <div className="warning-details">
            <h3>Important limitations to be aware of:</h3>
            <ul>
              <li>
                <strong>Simplified assumptions:</strong> The simulator uses a simplified model of electoral behavior 
                and does not account for local factors, candidate effects, or tactical voting.
              </li>
              <li>
                <strong>Baseline data:</strong> Vote patterns are based on estimates from past elections adapted 
                to new boundaries, and will <strong>contain errors</strong>.
              </li>
              <li>
                <strong>Uniform changes:</strong> The default model applies changes uniformly across constituencies, 
                which rarely happens in real elections.
              </li>
              <li>
                <strong>No demographic modeling:</strong> The simulator doesn't account for demographic shifts 
                or differential turnout.
              </li>
              <li>
                <strong>Reform vote:</strong> Reform's baseline vote from 2021 is the combination of Reform UK estimates + Abolish estimates. This is a simple way of stopping 
                extreme results when using swing models (a common problem when dealing with new popular parties). WES data shows this transfere of voters is a reasonable assumptions
                but it will <strong> still contain errors</strong> .
              </li>
            </ul>
            
            <p className="warning-purpose">
              This tool is intended to help users understand how the D'Hondt proportional representation system 
              translates votes into seats, not to predict actual election outcomes.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default WarningModal;