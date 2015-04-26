<?php

namespace Cunningsoft\MatchBundle\Listener;

use Psr\Log\LoggerInterface;
use SoccerSimulation\Common\FSM\EnterStateEvent;
use SoccerSimulation\Common\FSM\CannotKickBallEvent;
use SoccerSimulation\Common\FSM\MessagePassToMeEvent;
use SoccerSimulation\Common\FSM\PassEvent;
use SoccerSimulation\Common\FSM\ShotEvent;

class LogListener
{
    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @param EnterStateEvent $event
     */
    public function onStateEnter(EnterStateEvent $event)
    {
        $this->logger->info($event->getOwner()->getName() . ' enters ' . $event->getState()->getName() . ' state');
    }

    /**
     * @param MessagePassToMeEvent $event
     */
    public function onMessagePassToMe(MessagePassToMeEvent $event)
    {
        if ($event->getPassIsExecuted()) {
            $this->logger->notice($event->getPassingPlayer()->getName() . ' received request from ' . $event->getRequestingPlayer()->getName() . ' to pass the ball - and passes it to him');
        } else {
            $this->logger->notice($event->getPassingPlayer()->getName() . ' received request from ' . $event->getRequestingPlayer()->getName() . ' to pass the ball, but he is not able to do so');
        }
    }

    /**
     * @param CannotKickBallEvent $event
     */
    public function onCannotKickBall(CannotKickBallEvent $event)
    {
        $this->logger->notice($event->getPlayer()->getName() . ' cannot kick ball: ' . $event->getReason());
    }

    /**
     * @param ShotEvent $event
     */
    public function onShot(ShotEvent $event)
    {
        $this->logger->notice($event->getPlayer()->getName() . ' attempts a shot');
    }

    /**
     * @param PassEvent $event
     */
    public function onPass(PassEvent $event)
    {
        $this->logger->notice($event->getPlayer()->getName() . ' passes the ball to ' . $event->getReceiver()->getName());
    }
}
