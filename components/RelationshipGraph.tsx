import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Character, Relationship } from '../types';

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

// FIX: Explicitly define properties added by d3 simulation to resolve TypeScript errors.
// These properties might not be correctly inferred from the extended d3.SimulationNodeDatum type.
interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// FIX: Remove source and target properties to correctly inherit them from d3.SimulationLinkDatum<Node>.
// This allows d3 to replace string IDs with Node objects during simulation.
interface Link extends d3.SimulationLinkDatum<Node> {
  relationship: string;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ characters, relationships }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || characters.length === 0) return;

    const nodes: Node[] = characters.map(c => ({ id: c.name, name: c.name }));
    const links: Link[] = relationships.map(r => ({
      source: r.character1,
      target: r.character2,
      relationship: r.relationship,
    }));

    const { width, height } = containerRef.current.getBoundingClientRect();
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    svg.selectAll('*').remove(); // Clear previous render

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0));

    const link = svg.append('g')
      .attr('stroke', '#94A3B8')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .text(d => d.relationship)
      .attr('fill', '#475569')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    node.append('circle')
      .attr('r', 30)
      .attr('fill', '#7C3AED')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);
    
    node.append('text')
      .text(d => d.name)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1E293B')
      .style('font-weight', 'bold');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      linkLabel
        .attr('x', d => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr('y', d => ((d.source as Node).y! + (d.target as Node).y!) / 2);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    const handleResize = () => {
        if (containerRef.current) {
            const { width: newWidth, height: newHeight } = containerRef.current.getBoundingClientRect();
            d3.select(svgRef.current)
                .attr('width', newWidth)
                .attr('height', newHeight)
                .attr('viewBox', [-newWidth / 2, -newHeight / 2, newWidth, newHeight]);
            simulation.force('center', d3.forceCenter(0, 0));
            simulation.alpha(0.3).restart();
        }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
        simulation.stop();
        window.removeEventListener('resize', handleResize);
    }

  }, [characters, relationships]);

  const drag = (simulation: d3.Simulation<Node, undefined>) => {
    function dragstarted(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag<any, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RelationshipGraph;