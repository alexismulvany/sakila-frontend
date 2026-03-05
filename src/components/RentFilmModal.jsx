import React, { useState, useEffect } from "react";

export default function RentFilmModal({ filmId, filmTitle, onClose, onSuccess }) {
    const [stockInfo, setStockInfo] = useState({ stock: 0, inventory_id: null });
    const [loadingStock, setLoadingStock] = useState(true);

    const [customerId, setCustomerId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Get stock of film
    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await fetch(`/api/films/${filmId}/availability`);
                if (!response.ok) throw new Error("Failed to fetch stock");
                const data = await response.json();
                setStockInfo(data);
            } catch (err) {
                setError("Could not load inventory data.");
            } finally {
                setLoadingStock(false);
            }
        };
        fetchStock();
    }, [filmId]);

    // Handle the rental submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/rentals', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: customerId,
                    inventory_id: stockInfo.inventory_id
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Successfully rented ${filmTitle}!`);
                onSuccess();
                onClose();
            } else {
                setError(result.error || "Failed to rent film.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Rent Film: {filmTitle}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {loadingStock ? (
                            <p className="text-center my-4">Checking inventory...</p>
                        ) : (
                            <>
                                {/* Stock Indicator */}
                                <div className="text-center mb-4">
                                    {stockInfo.stock > 0 ? (
                                        <h4 className="text-success">In Stock: {stockInfo.stock} copies available</h4>
                                    ) : (
                                        <h4 className="text-danger">Currently Out of Stock</h4>
                                    )}
                                </div>

                                {error && <div className="alert alert-danger py-2">{error}</div>}

                                {/* Only show the form if we have stock */}
                                {stockInfo.stock > 0 && (
                                    <form id="rentForm" onSubmit={handleSubmit} className="px-3">
                                        <div className="mb-3">
                                            <label className="form-label text-muted small mb-1">Enter Customer ID</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg text-center"
                                                value={customerId}
                                                onChange={(e) => setCustomerId(e.target.value)}
                                                required
                                                autoFocus
                                                placeholder="e.g. 15"
                                            />
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        {/* Hide the submit button completely if out of stock */}
                        {stockInfo.stock > 0 && (
                            <button type="submit" form="rentForm" className="btn btn-success" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Submit Rental"}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}